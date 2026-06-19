import type rulesConfiguration from "@/rules.config";

type CustomRuleAliases = (typeof rulesConfiguration)["aliases"];

declare module "vuetify/labs/rules" {
  interface RuleAliases extends CustomRuleAliases {}
}
