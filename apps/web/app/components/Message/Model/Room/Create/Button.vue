<script setup lang="ts">
import { DEFAULT_NAME } from "#shared/services/constants";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useRoomStore } from "#src/store/message/room/index";

const roomStore = useRoomStore();
const { createRoom } = roomStore;
</script>

<template>
  <!-- Stopped, since it sits in the heading row that folds the list away on a click -->
  <UiIconButton
    label="Create room"
    :meaning="UiIconMeaning.Create"
    :variant="UiButtonVariant.Quiet"
    @click.stop="createRoom({ name: DEFAULT_NAME })"
  />
</template>
