const config = {
    moduleDirectories: ['node_modules', 'src'],
    collectCoverage: false,
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: [`<rootDir>/test/**/*.spec.ts`]
};

module.exports = config;