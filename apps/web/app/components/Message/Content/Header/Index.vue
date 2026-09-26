<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useRoomStore } from "@/store/message/room";
import { useRoomDialogStore } from "@/store/message/room/dialog";

const roomStore = useRoomStore();
const { currentRoom, isCreator } = storeToRefs(roomStore);
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
const roomName = useRoomName(() => currentRoom.value?.id ?? "");
</script>

<!-- The room's name and topic on one line, as a channel's header has them, and the room's tools at its end. Its creator
     edits the room from its name. One header at every width: the call, the search and the member list out, the rest
     behind the room's overflow menu, so a phone reads the same header as a desktop and needs no second bar of buttons
     above the composer. The topic yields first, from the width below which it would leave the name no room -->
<template>
  <header v-if="currentRoom" px-2 py-1 flex shrink-0 gap-1 ui-bar items-center>
    <MessageContentShowRoomListButton />
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
        <span v-if="currentRoom.topic" class="hidden sm:inline" text-muted truncate>{{ currentRoom.topic }}</span>
        <UiIcon :meaning="UiIconMeaning.Edit" op-0 group-focus-visible:op-100 group-hover:op-100 />
      </UiButton>
    </UiTooltip>
    <!-- Only its creator may edit it, so for anyone else the name is only read -->
    <div v-else px-3 flex gap-2 min-w-0 items-center>
      <UiAvatar :image="currentRoom.image" :name="roomName" is-small />
      <span text-heading-color truncate>{{ roomName }}</span>
      <span v-if="currentRoom.topic" class="hidden sm:inline" text-muted truncate>{{ currentRoom.topic }}</span>
    </div>
    <div flex-1 />
    <div flex shrink-0 gap-1 items-center>
      <MessageContentCallButton />
      <MessageContentShowSearchButton />
      <MessageContentShowMemberListButton />
      <MessageContentHeaderOverflowMenu />
    </div>
  </header>
  <MessageContentHeaderDirectMessage v-else />
  <MessageContentHeaderEditRoomDialog v-if="currentRoom" :room="currentRoom" />
</template>
