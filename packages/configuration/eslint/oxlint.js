import oxlint from "eslint-plugin-oxlint";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";

export default defineConfig(
  ...oxlint.buildFromOxlintConfigFile(fileURLToPath(new URL("../../../.oxlintrc.json", import.meta.url))),
);
