import type { UiRule } from "@/models/ui/UiRule";

import { profanity } from "@2toad/profanity";

// Every rule a field takes, each worded the same way so a field mixing them reads as one form: "You must enter a
// Minimum of {n} characters" beside "You must enter a value of at least {n}". An empty field passes every rule but
// `required`, so a field that may be left empty says nothing until something is typed
export const UiRules = {
  isNotProfanity:
    (message = "This field cannot contain profanity"): UiRule =>
    (value) =>
      !profanity.exists(value) || message,
  maxLength:
    (maximum: number, message = `You must enter a maximum of ${maximum} characters`): UiRule =>
    (value) =>
      value.length <= maximum || message,
  maxValue:
    (maximum: number, message = `You must enter a value of at most ${maximum}`): UiRule =>
    (value) =>
      value === "" || Number(value) <= maximum || message,
  // A numeric field's text, so `0` is a value the field holds rather than nothing entered: `minValue(1)` on a
  // Slowmode field refuses zero seconds
  minValue:
    (minimum: number, message = `You must enter a value of at least ${minimum}`): UiRule =>
    (value) =>
      value === "" || Number(value) >= minimum || message,
  pattern:
    (regex: RegExp, message = "Invalid format"): UiRule =>
    (value) =>
      value === "" || regex.test(value) || message,
  required:
    (message = "This field is required"): UiRule =>
    (value) =>
      value !== "" || message,
};
