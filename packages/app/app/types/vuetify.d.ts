import type { ValidationRuleBuilderWithOptions, ValidationRuleBuilderWithoutOptions } from "vuetify/labs/rules";

declare module "vuetify/labs/rules" {
  interface RuleAliases {
    isNotProfanity: ValidationRuleBuilderWithoutOptions;
    requireAtLeastN: ValidationRuleBuilderWithOptions<number>;
    requireAtMostMaxFileSize: ValidationRuleBuilderWithoutOptions;
  }
}
