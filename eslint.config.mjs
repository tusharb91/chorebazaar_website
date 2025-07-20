// eslint.config.mjs

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginTs from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import next from "eslint-plugin-next";


export default [
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "coverage",
      "prisma",
      "**/*.d.ts",
      "src/generated",
      "src/generated/prisma",
      
    ],
  },

  {
    plugins: { next },
    extends: ["plugin:next/recommended"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      react: pluginReact,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "off",
      "no-undef": "off",
    },
  },
];