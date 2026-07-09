// @ts-check
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import("eslint").Linter.Config[]} */
const nextConfig = require("eslint-config-next");

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "claude-poc-docs/**",
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "public/mockServiceWorker.js", // MSW 自動生成ファイル（npx msw init public/）
    ],
  },
  ...nextConfig,
];

export default config;
