// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";

export default tseslint.config(
  { ignores: ["dist/**", "coverage/**"] },

  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Express needs the 4-arg (err, req, res, next) shape or it treats the
      // error handler as ordinary middleware, so unused args must be allowed
      // when prefixed with an underscore.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // pino replaces console.
      "no-console": "error",
    },
  },

  // eslint.config.js itself is JS and is not in tsconfig's include, so the
  // type-aware rules have to come off for it.
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Must stay last so it can switch off anything that fights Prettier.
  prettier,
);
