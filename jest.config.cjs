const config = {
    moduleDirectories: ['node_modules', 'src'],
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**'],
    coveragePathIgnorePatterns: [
        "node_modules",
        "index.ts"
    ],
    coverageReporters: ["json", "json-summary", "html"],
    coverageDirectory: '<rootDir>/reports/coverage',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: [`<rootDir>/test/**/*.spec.ts`],
    reporters: ["default",
	["./node_modules/jest-html-reporter", {
		"pageTitle": "Tests",
        outputPath: '<rootDir>/reports/tests/index.html'
	}]],
};

module.exports = config;