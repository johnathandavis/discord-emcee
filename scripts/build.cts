import { JSONSchemaForNPMPackageJsonFiles2 as PackageJson } from '@schemastore/package';
import { JSONSchemaForTheTypeScriptCompilerSConfigurationFile as TsConfig } from '@schemastore/tsconfig';
import fs from 'fs/promises';
import path from 'path';
import cp from 'child_process';

process.env['NO_COLOR'] = '1';

const { spawn } = cp;

const rootDir = path.resolve(__dirname, '../');
const tsConfigPath = path.join(rootDir, 'tsconfig.base.json');
const packageJsonPath = path.join(rootDir, 'package.json');

const exec = async (name: string, args: string[]): Promise<string> => {
  console.log(`Executing ${name} ${args.join(' ')}...`);
  const subprocess = spawn(name, args, {
    cwd: rootDir
  });

  let stdOut: string = '';
  let stdErr: string = '';
  subprocess.stdout.setEncoding('utf8');
  subprocess.stdout.on('data', (d) => stdOut += d.toString());
  subprocess.stdout.setEncoding('utf8');
  subprocess.stderr.on('data', (d) => stdErr += d.toString());

  return new Promise<string>((resolve, reject) => {
    subprocess.on('exit', (code) => {
      if (code === 0) {
        resolve(stdOut);
      } else {
        reject(new Error(`Command '${name}' exited with code ${code}:\n${stdErr}`));
      }
    });
  });

}

const getPackageJson = async (): Promise<PackageJson> => JSON.parse((await fs.readFile(packageJsonPath)).toString('utf8'))

const tsc = async (tsConfigPath: string) => await exec('tsc', ['-p', path.relative(process.cwd(), tsConfigPath)]);

const buildWithConfig = async (tsConfigPath: string, tsConfigOverrides?: TsConfig): Promise<string> => {

  const providedConfig = JSON.parse((await fs.readFile(tsConfigPath)).toString('utf8')) as TsConfig;
  const mergedConfig = {
    ...providedConfig,
    ...(tsConfigOverrides ?? {})
  };
  mergedConfig.compilerOptions = {
    ...providedConfig.compilerOptions!,
    ...(tsConfigOverrides?.compilerOptions ?? {})
  };
  mergedConfig.compilerOptions.baseUrl = rootDir;
  const modifiedPath = path.join(rootDir, '.tsconfig.json');
  await fs.writeFile(modifiedPath, JSON.stringify(mergedConfig));
  const result = await tsc(modifiedPath);
  return result;
}

const commonJs: Partial<TsConfig> = {
  compilerOptions: {
    module: 'CommonJS',
    outDir: 'dist/cjs'
  }
}
const esm: Partial<TsConfig> = {
  compilerOptions: {
    module: 'ESNext',
    outDir: 'dist/esm'
  }
}

const build = async (): Promise<void> => {
  const pkgJson = await getPackageJson();

  await buildWithConfig(tsConfigPath, esm);
  await buildWithConfig(tsConfigPath, commonJs);
  const commonJsPkgJson = {...pkgJson, 'type': 'commonjs'};
  const cjsPkgJsonOverridePath = path.join(rootDir, 'dist/cjs/package.json');
  await fs.writeFile(cjsPkgJsonOverridePath, JSON.stringify(commonJsPkgJson));
}

console.log('Building...');
build().then((d) => {
  console.log('Done!');
}).catch((e) => {
  console.error('Build failed:');
  console.error(e);
});

export {};