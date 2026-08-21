<script setup lang="ts">
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

const name = defineModel<string>({ required: true });
const rules = useVRules();
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
    :placeholder="`${SuggestionTrigger.Emoji}avocado${SuggestionTrigger.Emoji}`"
    :prefix="SuggestionTrigger.Emoji"
    :rules="nameRules"
    :suffix="SuggestionTrigger.Emoji"
  />
</template>

<style scoped>
:deep(.v-field__field > input) {
  width: auto;
}
</style>
