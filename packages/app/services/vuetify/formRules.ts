/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import deepEqual from "deep-equal";
import type { ArrayElement } from "type-fest/source/internal";
import type { VValidation } from "vuetify/components";

// @TODO: Internal vuetify types
// https://github.com/vuetifyjs/vuetify/issues/16680
type ValidationRule = ArrayElement<NonNullable<VValidation["$props"]["rules"]>>;

type FormFieldValue = string | string[] | null;

export const formRules: {
  required: ValidationRule;
  requireAtMostNCharacters: (n: number) => ValidationRule;
  isNotEqual: (oldValue: FormFieldValue) => ValidationRule;
} = {
  required: (value: FormFieldValue) => (value && value.length > 0) || "required",
  requireAtMostNCharacters: (n) => (value: FormFieldValue) => (value && value.length <= n) || `max ${n} characters`,
  isNotEqual: (oldValue) => (value: FormFieldValue) =>
    !deepEqual(value, oldValue) || `new value cannot be the same as the existing value`,
};
