import oxlint from "eslint-plugin-oxlint";
import { defineConfig } from "eslint/config";

import oxlintConfiguration from "../../../oxlint.config.ts";

export default defineConfig(...oxlint.buildFromOxlintConfig(oxlintConfiguration));
