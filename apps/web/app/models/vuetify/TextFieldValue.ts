// A text field's value is text, except where `type="number"` binds a numeric model — Vuetify hands the rule
// Whatever the model holds, so a rule typed as text-only reads `0` as an empty field instead of as a value
export type TextFieldValue = null | number | string;
