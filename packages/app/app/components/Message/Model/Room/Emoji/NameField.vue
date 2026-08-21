<script setup lang="ts">
import { getEmojiShortcode } from "@/services/message/emoji/getEmojiShortcode";
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

const name = defineModel<string>({ required: true });
const rules = useVRules();
// Vuetify draws the prefix and suffix only once the field is active, so an empty unfocused field has no colons of
// Its own and the placeholder carries them; on focus they appear and the placeholder must stop, or the reader gets
// Two pairs
const isFocused = ref(false);
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
    ps-0
    :placeholder="isFocused ? '' : getEmojiShortcode('avocado')"
    :prefix="SuggestionTrigger.Emoji"
    :rules="nameRules"
    :suffix="SuggestionTrigger.Emoji"
    @focus="isFocused = true"
    @blur="isFocused = false"
  />
</template>

<style scoped>
:deep(.v-field__field > input) {
  flex: 0 1 auto;
  width: auto;
  field-sizing: content;
}
</style>
