import { Linter } from "eslint";
import { describe } from "vitest";
import parser from "vue-eslint-parser";

// Lints one `.vue` source under a plugin's flat config and counts the messages the named rule reports on it
export const countVueRuleViolations = (configuration: Linter.Config[], source: string, ruleId: string): number =>
  new Linter({ configType: "flat" })
    .verify(source, [...configuration, { files: ["**/*.vue"], languageOptions: { parser } }], "a.vue")
    .filter((message) => message.ruleId === ruleId).length;

describe.todo("countVueRuleViolations");
