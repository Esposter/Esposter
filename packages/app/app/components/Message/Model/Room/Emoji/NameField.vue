<script setup lang="ts">
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

const name = defineModel<string>({ required: true });
const rules = useVRules();
// The colons are the field's chrome rather than part of its value: they are drawn either side of the input, so
// The caret can never reach them and every rule below is checked against the name alone. A `:name:` copied out
// Of a message is still what someone pastes here, so a colon that arrives that way is dropped rather than
// Failing a charset that has no room for one
const enteredName = computed({
  get: () => name.value,
  set: (newName) => {
    name.value = newName.replaceAll(SuggestionTrigger.Emoji, "");
  },
});
const nameRules = computed(() => [
  rules.required(),
  rules.maxLength(ROOM_EMOJI_NAME_MAX_LENGTH),
  rules.pattern(ROOM_EMOJI_NAME_REGEX, "Lowercase letters, numbers and underscores only"),
]);
</script>

<template>
  <v-text-field
    v-model="enteredName"
    :prefix="SuggestionTrigger.Emoji"
    :rules="nameRules"
    :suffix="SuggestionTrigger.Emoji"
  />
</template>
