import deepEqual from "deep-equal";
import type { ArrayElement } from "type-fest/source/internal";
import type { VValidation } from "vuetify/components";

// @NOTE: Vuetify 3 doesn't export ValidationRule type...
// So we'll hack our way through to grab the type from a component
type ValidationRule = ArrayElement<NonNullable<VValidation["$props"]["rules"]>>;

type FormFieldValue = string | string[] | null;

export const formRules: {
  required: ValidationRule;
  requireAtMostNCharacters: (n: number) => ValidationRule;
  isNotEqual: (oldValue: FormFieldValue) => ValidationRule;
} = {
  required: (value: FormFieldValue) => (value && value.length > 0) || "required",
  requireAtMostNCharacters: (n) => (value: FormFieldValue) => (value && value.length <= n) || `max ${n} characters`,
  isNotEqual: (oldValue: FormFieldValue) => (value: FormFieldValue) =>
    !deepEqual(value, oldValue) || `new value cannot be the same as the existing value`,
};
