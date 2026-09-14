import type {
  ValidationRuleBuilderWithOptions,
  ValidationRuleBuilderWithoutOptions,
} from "vuetify/lib/composables/rules/index.js";

declare module "vuetify/lib/composables/rules/index.js" {
  interface RuleAliases {
    isNotProfanity: ValidationRuleBuilderWithoutOptions;
    minValue: ValidationRuleBuilderWithOptions<number>;
  }
}
