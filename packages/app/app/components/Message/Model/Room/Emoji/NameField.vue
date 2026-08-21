<script setup lang="ts">
import type { ValidationRule } from "vuetify/lib/composables/validation.mjs";

import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

const name = defineModel<string>({ required: true });
const rules = useVRules();
// The field holds the shortcode and the model holds the name, so a colon is written for the reader and never
// Entered: it is stripped from anything typed or pasted, which is what lets a `:name:` copied out of a message land
// As a name. An empty name draws an empty field rather than a bare pair of colons, so the placeholder is visible
const shortcode = computed({
  get: () => (name.value ? getEmojiShortcode(name.value) : ""),
  set: (newShortcode) => {
    name.value = newShortcode.replaceAll(SuggestionTrigger.Emoji, "");
  },
});
// Validated against the name rather than the field's own value — the colons the field draws are not part of the
// Charset the name is checked against, so every rule would fail on the value that displays them. A rule is allowed
// To be a bare message rather than a predicate, so the name goes through whichever the builder answered with
const getNameRule = (rule: ValidationRule) => () => (typeof rule === "function" ? rule(name.value) : rule);
const nameRules = computed(() => [
  getNameRule(rules.required()),
  getNameRule(rules.maxLength(ROOM_EMOJI_NAME_MAX_LENGTH)),
  getNameRule(rules.pattern(ROOM_EMOJI_NAME_REGEX, "Lowercase letters, numbers and underscores only")),
]);
</script>

<template>
  <v-text-field v-model="shortcode" :rules="nameRules" />
</template>
