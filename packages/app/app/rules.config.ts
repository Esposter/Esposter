import type { TextFieldValue } from "@/models/vuetify/TextFieldValue";
import type { RulesOptions } from "vuetify/labs/rules";

import { profanity } from "@2toad/profanity";

export default {
  aliases: {
    isNotProfanity: (err) => (value: TextFieldValue) =>
      !value || !profanity.exists(value) || err || `This field cannot contain profanity`,
    requireAtLeastN: (n, err) => (value: TextFieldValue) =>
      !value || Number(value) >= n || err || `Must be at least ${n}`,
  },
} satisfies RulesOptions;
