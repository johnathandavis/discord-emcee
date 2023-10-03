module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "plugins": [
        "@typescript-eslint",
        '@typescript-eslint/eslint-plugin',
        'eslint-plugin-jsdoc',
        'eslint-plugin-tsdoc',
        "prettier",
        "only-warn"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jsdoc/recommended-typescript",
        "prettier"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        "no-console": 1,       // Warning
        "prettier/prettier": "error", // Error
        "tsdoc/syntax": "error", // Error
        "jsdoc/require-jsdoc": [
            "error",
            {
              publicOnly: {
                cjs: true,
                esm: true,
                window: true,
              },
              require: {
                ArrowFunctionExpression: true,
                ClassDeclaration: true,
                ClassExpression: true,
                FunctionDeclaration: true,
                FunctionExpression: true,
                MethodDefinition: true,
              },
              contexts: [
                "TSInterfaceDeclaration",
                "TSTypeAliasDeclaration",
                "TSEnumDeclaration",
                "TSPropertySignature",
              ],
            },
          ]
    }
}
