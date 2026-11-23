import depend from "@esposter/configuration/eslint/plugins/depend.js";
import json from "@esposter/configuration/eslint/plugins/json.js";
import perfectionist from "@esposter/configuration/eslint/plugins/perfectionist.js";
import unocss from "@esposter/configuration/eslint/plugins/unocss.js";
import { defineConfig } from "eslint/config";

export default defineConfig(depend, json, perfectionist, unocss);
