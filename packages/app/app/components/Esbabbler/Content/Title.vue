<script setup lang="ts">
import { ROOM_NAME_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { formRules } from "@/services/vuetify/formRules";
import { useRoomStore } from "@/store/esbabbler/room";

const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoomId, currentRoomName } = storeToRefs(roomStore);
const editedRoomName = ref(currentRoomName.value);
const isUpdateMode = ref(false);
const title = useTemplateRef("title");
const titleHovered = ref(false);
const { text } = useColors();
const borderColor = computed(() => (!isUpdateMode.value && titleHovered.value ? text.value : "transparent"));
const onUpdateRoom = async () => {
  try {
    if (!currentRoomId.value || !editedRoomName.value || editedRoomName.value === currentRoomName.value) return;

    await $trpc.room.updateRoom.mutate({
      id: currentRoomId.value,
      name: editedRoomName.value,
    });
  } finally {
    isUpdateMode.value = false;
    editedRoomName.value = currentRoomName.value;
  }
};

onClickOutside(
  title,
  getSynchronizedFunction(async () => {
    if (isUpdateMode.value) await onUpdateRoom();
  }),
);
</script>

<template>
  <div
    ref="title"
    class="custom-border"
    px-1
    flex
    items-center
    :w="isUpdateMode ? 'full' : undefined"
    rd
    @mouseenter="titleHovered = true"
    @mouseleave="titleHovered = false"
  >
    <v-text-field
      v-if="isUpdateMode"
      v-model="editedRoomName"
      density="compact"
      font-bold
      hide-details
      autofocus
      text-xl
      :rules="[
        formRules.required,
        formRules.requireAtMostNCharacters(ROOM_NAME_MAX_LENGTH),
        formRules.isNotEqual(currentRoomName),
        formRules.isNotProfanity,
      ]"
      @keydown.enter="onUpdateRoom"
    />
    <v-toolbar-title v-else font-bold="!" select="all" @click="isUpdateMode = true">
      {{ currentRoomName }}
    </v-toolbar-title>
  </div>
</template>

<style scoped lang="scss">
.custom-border {
  border: 1px $border-style-root v-bind(borderColor);
}
</style>
