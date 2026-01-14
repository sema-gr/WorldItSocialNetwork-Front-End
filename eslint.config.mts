import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";

const nodeGlobals = {
    require: "readonly",
    module: "readonly",
    __dirname: "readonly",
    __filename: "readonly",
    process: "readonly",
    global: "readonly",
};

export default defineConfig([
    {
        ignores: [
            "*.bundle",
            "*.bundle.js",
            "*.bundle.map",
            "*.bundle.jsx",
            "*.bundle.ts",
            "*.bundle.tsx",
            "**/*.bundle",
            "**/*.bundle.js",
            "**/*.bundle.map",
            "**/entry.js",
            "**/AppEntry.js",
            "**/Expo.fx.js",
            ".expo",
            ".expo/**",
            ".expo-shared",
            "**/node_modules/expo/**",
            "**/node_modules/react-native/**",
            "dist/_expo/**",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [js.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...nodeGlobals,
                __d: "readonly",
                __r: "readonly",
            },
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: "module",
            },
        },
        rules: {
            "no-unused-vars": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        files: ["**/*.{ts,mts,cts,tsx,jsx}"],
        plugins: { "unused-imports": unusedImports },
        extends: [tseslint.configs.recommended, pluginReact.configs.flat.recommended],
        languageOptions: {
            globals: {
                ...nodeGlobals,
                __d: "readonly",
                __r: "readonly",
            },
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: "module",
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-expressions": "off",
            "react/no-unescaped-entities": "warn",
            "react/display-name": "warn",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
]);
