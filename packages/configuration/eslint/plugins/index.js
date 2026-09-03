import depend from "@esposter/configuration/eslint/plugins/depend.js";
import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import pinia from "@esposter/configuration/eslint/plugins/pinia.js";
import unocss from "@esposter/configuration/eslint/plugins/unocss.js";
import vuejsAccessibility from "@esposter/configuration/eslint/plugins/vuejsAccessibility.js";
import { defineConfig } from "eslint/config";

export default defineConfig(depend, perfectionist, pinia, unocss, vuejsAccessibility);
