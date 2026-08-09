import type { TextFieldValue } from "@/models/vuetify/TextFieldValue";
import type { RulesOptions } from "vuetify/labs/rules";

import { profanity } from "@2toad/profanity";

// Named and worded in Vuetify's own voice — `minValue` beside `minLength`, "You must enter a value of at least
// {n}" beside "You must enter a minimum of {n} characters" — so a field mixing these with built-ins reads as one
// Form. The copy is a literal rather than a `$vuetify.rules.*` entry because a custom alias is handed no locale
// Instance, and giving it one means merging Vuetify's full `en` over the app config: an import every mount pays
// For a translation layer the app does not have while i18n stays deferred
export default {
  aliases: {
    isNotProfanity: (error) => (value: TextFieldValue) =>
      !value || !profanity.exists(value) || error || "This field cannot contain profanity",
    minValue: (minimum, error) => (value: TextFieldValue) =>
      !value || Number(value) >= minimum || error || `You must enter a value of at least ${minimum}`,
  },
} satisfies RulesOptions;
