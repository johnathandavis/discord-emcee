import vm, { createContext, Context, runInContext } from 'vm';
import ts from 'typescript';
import path from 'path';
import fs from 'fs';

/*
export const setupContext = (enableSymbolDispose: boolean): Context => {
    const c = 
    runInContext('if (Symbol.dispose && enableSymbolDispose) { delete Symbol[\'dispose\']; }', c);
    runInContext('if (Symbol.dispose && enableSymbolDispose) { delete Symbol[\'dispose\']; }', c);
    return c;
}
*/

const pkgRoot = path.resolve(__dirname, '../');

class ContextHelper {
    private readonly context: Context;

    constructor() {
        this.context = createContext({});
    }

    eraseSymboleDispose = () => {
        runInContext('if (Symbol.dispose) { delete Symbol[\'dispose\']; }', this.context);
    }

    defineSymboleDispose = () => {
        runInContext('if (!Symbol.dispose) { Symbol[\'dispose\'] = Symbol(\'Symbol.dispose_original\'); }', this.context);
    }

    getSymbolDispose = () => {
        return runInContext('Symbol.dispose', this.context);
    }

    requireTs = (tsFile: string) => {
        const jsFile = this.compileTs(tsFile);
        const jsText = fs.readFileSync(jsFile).toString('utf8');

        try {
            runInContext(jsText, this.context);
        } finally {
            //fs.rmSync(jsFile);
        }
    }

    private compileTs = (tsFile: string): string => {
        const program = ts.createProgram([tsFile], {
            target: ts.ScriptTarget.ES2015,
            rootDir: pkgRoot,
            types: ['node'],
            typeRoots: [ path.join(pkgRoot, 'node_modules', '@types')],
            baseUrl: path.join(pkgRoot, 'src')
        });
        program.emit();
        return tsFile.replace('.ts', '.js');
    }
}

export default ContextHelper;