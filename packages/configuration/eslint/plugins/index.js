import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import unocss from "@esposter/configuration/eslint/plugins/unocss.js";
import { defineConfig } from "eslint/config";

export default defineConfig(perfectionist, unocss);
