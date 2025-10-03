import oxlint from "eslint-plugin-oxlint";
import { defineConfig } from "eslint/config";

export default defineConfig(...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"));
