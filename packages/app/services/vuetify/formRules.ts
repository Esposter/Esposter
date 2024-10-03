/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import type { ArrayElement } from "type-fest/source/internal";
import type { VValidation } from "vuetify/components";

import deepEqual from "fast-deep-equal";

// @TODO: Internal vuetify types
// https://github.com/vuetifyjs/vuetify/issues/16680
type ValidationRule = ArrayElement<NonNullable<VValidation["$props"]["rules"]>>;

type FormFieldValue = null | string | string[];

export const formRules: {
  isNotEqual: (oldValue: FormFieldValue) => ValidationRule;
  requireAtMostNCharacters: (n: number) => ValidationRule;
  required: ValidationRule;
} = {
  isNotEqual: (oldValue) => (value: FormFieldValue) =>
    !deepEqual(value, oldValue) || `new value cannot be the same as the existing value`,
  requireAtMostNCharacters: (n) => (value: FormFieldValue) => (value && value.length <= n) || `max ${n} characters`,
  required: (value: FormFieldValue) => (value && value.length > 0) || "required",
};
