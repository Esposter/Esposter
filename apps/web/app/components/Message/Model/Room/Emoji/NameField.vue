<script setup lang="ts">
import { SuggestionTrigger } from "@/models/shared/SuggestionTrigger";
import { UiRules } from "@/services/ui/UiRules";
import { ROOM_EMOJI_NAME_MAX_LENGTH, selectRoomEmojiInMessageSchema } from "@esposter/db-schema";

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
// The rule is the schema the server parses the name with, so the field and every save gate agree on what a name is, and
// A name the field accepts is one the server stores: the schema trims before it checks, as the server does
const nameRules = [
  UiRules.required(),
  (value: string) =>
    value === "" ||
    selectRoomEmojiInMessageSchema.shape.name.safeParse(value).success ||
    `You must enter ${ROOM_EMOJI_NAME_MAX_LENGTH} or fewer lowercase letters, numbers or underscores`,
];
</script>

<template>
  <UiTextField v-model="enteredName" :is-autofocus :is-label-hidden label="Emoji name" :rules="nameRules" />
</template>
