<script setup lang="ts">
import { SuggestionTrigger } from "@/services/message/SuggestionTrigger";
import { UiRules } from "@/services/ui/UiRules";
import { ROOM_EMOJI_NAME_MAX_LENGTH, ROOM_EMOJI_NAME_REGEX } from "@esposter/db-schema";

interface Props {
  isAutofocus?: true;
  // Named for assistive technology alone, where the row the field sits in already says it is the emoji's name
  isLabelHidden?: true;
}

const name = defineModel<string>({ required: true });
const { isAutofocus, isLabelHidden } = defineProps<Props>();
// The colons are the shortcode's rather than the name's, so a pasted `:avocado:` keeps only what is between them
const enteredName = computed({
  get: () => name.value,
  set: (newName) => {
    name.value = newName.replaceAll(SuggestionTrigger.Emoji, "");
  },
});
const nameRules = [
  UiRules.required(),
  UiRules.maxLength(ROOM_EMOJI_NAME_MAX_LENGTH),
  UiRules.pattern(ROOM_EMOJI_NAME_REGEX, "Lowercase letters, numbers and underscores only"),
];
</script>

<template>
  <UiTextField v-model="enteredName" :is-autofocus :is-label-hidden label="Emoji name" :rules="nameRules" />
</template>
