import globals from "globals"
import tseslint from "typescript-eslint"
import typescriptParser from "@typescript-eslint/parser"
import eslintPluginPrettier from "eslint-plugin-prettier"

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "comma-dangle": "off",
      "@typescript-eslint/comma-dangle": "off",
      "space-before-function-paren": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "@typescript-eslint/no-base-to-string": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: false,
          trailingComma: "es5",
          tabWidth: 2,
          printWidth: 80,
          arrowParens: "always",
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: globals.node,
    },
  },
]
