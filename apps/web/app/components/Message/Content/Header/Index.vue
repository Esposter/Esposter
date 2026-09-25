<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";

const { smAndDown } = useUiDisplay();
const roomStore = useRoomStore();
const { currentRoom, isCreator } = storeToRefs(roomStore);
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
const roomName = useRoomName(() => currentRoom.value?.id ?? "");
</script>

<!-- The room's name and topic on one line, as a channel's header has them, and the room's tools at its end. Its creator
     edits the room from its name -->
<template>
  <header v-if="currentRoom" px-2 py-1 flex shrink-0 gap-1 ui-bar items-center>
    <!-- On small screens the mobile action bar above the composer owns room list, room actions, and search -->
    <MessageContentShowRoomListButton v-if="!smAndDown" />
    <UiTooltip v-if="isCreator" #default="{ activatorProps }" label="Edit Room">
      <UiButton
        :="activatorProps"
        :variant="UiButtonVariant.Quiet"
        class="group"
        min-w-0
        @click="isEditRoomDialogOpen = true"
      >
        <UiAvatar :image="currentRoom.image" :name="roomName" is-small />
        <span text-heading-color truncate>{{ roomName }}</span>
        <span v-if="currentRoom.topic" text-muted truncate>{{ currentRoom.topic }}</span>
        <UiIcon :meaning="UiIconMeaning.Edit" op-0 group-focus-visible:op-100 group-hover:op-100 />
      </UiButton>
    </UiTooltip>
    <!-- Only its creator may edit it, so for anyone else the name is only read -->
    <div v-else px-3 flex gap-2 min-w-0 items-center>
      <UiAvatar :image="currentRoom.image" :name="roomName" is-small />
      <span text-heading-color truncate>{{ roomName }}</span>
      <span v-if="currentRoom.topic" text-muted truncate>{{ currentRoom.topic }}</span>
    </div>
    <div flex-1 />
    <div flex shrink-0 gap-1 items-center>
      <MessageContentCallButton />
      <MessageContentNotificationSettingsMenuButton />
      <MessageContentHeaderActionButtons v-if="!smAndDown" />
      <MessageContentShowSearchButton v-if="!smAndDown" />
    </div>
  </header>
  <MessageContentHeaderDirectMessage v-else />
  <MessageContentHeaderEditRoomDialog v-if="currentRoom" :room="currentRoom" />
</template>
