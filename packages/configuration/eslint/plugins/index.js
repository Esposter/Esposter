import depend from "@esposter/configuration/eslint/plugins/depend.js";
import esposter from "@esposter/configuration/eslint/plugins/esposter.js";
import importPlugin from "@esposter/configuration/eslint/plugins/import.js";
import neverthrow from "@esposter/configuration/eslint/plugins/neverthrow.js";
import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import pinia from "@esposter/configuration/eslint/plugins/pinia.js";
import unocss from "@esposter/configuration/eslint/plugins/unocss.js";
import vitest from "@esposter/configuration/eslint/plugins/vitest.js";
import { defineConfig } from "eslint/config";

export default defineConfig(depend, esposter, importPlugin, neverthrow, perfectionist, pinia, unocss, vitest);
