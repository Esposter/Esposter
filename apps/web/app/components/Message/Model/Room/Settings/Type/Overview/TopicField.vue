<script setup lang="ts">
import { ROOM_TOPIC_MAX_LENGTH } from "@esposter/db-schema";

const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<!-- The field stops the typing at the limit rather than counting past it: the overview saves every field of the
     room in one write, so a topic over the limit held here would refuse every other save on the panel too -->
<template>
  <UiTextField
    v-model="modelValue"
    hint="Visible below the room name. Use /topic to update from chat."
    label="Topic"
    :maxlength="ROOM_TOPIC_MAX_LENGTH"
    @focusout="emit('save')"
    @keydown.enter.prevent="emit('save')"
  />
</template>
