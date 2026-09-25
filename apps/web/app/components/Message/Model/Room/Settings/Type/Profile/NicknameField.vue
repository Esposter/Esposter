<script setup lang="ts">
import { UiRules } from "@/services/ui/UiRules";
import { NICKNAME_MAX_LENGTH } from "@esposter/db-schema";

const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
const nicknameRules = [UiRules.maxLength(NICKNAME_MAX_LENGTH)];
// The field counts past its limit rather than stopping the typing there, so a name too long says so under the field
// And never reaches the server
const save = () => {
  if (modelValue.value.length <= NICKNAME_MAX_LENGTH) emit("save");
};
</script>

<template>
  <UiTextField
    v-model="modelValue"
    :counter="NICKNAME_MAX_LENGTH"
    hint="Overrides your global username within this room. Leave blank to use your global username."
    label="Nickname"
    :rules="nicknameRules"
    @focusout="save()"
    @keydown.enter.prevent="save()"
  />
</template>
