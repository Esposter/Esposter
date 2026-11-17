<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useLayoutStore } from "#src/store/layout";
import { useRoomDialogStore } from "#src/store/message/room/dialog";
import { useRoomStore } from "#src/store/message/room/index";

const roomStore = useRoomStore();
const { currentRoom, isCreator } = storeToRefs(roomStore);
const roomDialogStore = useRoomDialogStore();
const { isEditRoomDialogOpen } = storeToRefs(roomDialogStore);
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
</script>

<!-- The room's name and topic on one line, as a channel's header has them, and the room's tools at its end. Its creator
     edits the room from its name. One header at every width, with no second bar of buttons above the composer: where
     the drawers dock, the call, the search and the member list sit out beside the room's overflow menu; below that cut
     the room-list button takes their place, and they wait in the overflow menu as rows, the two toggles checked while
     their pane is open, so a phone's header holds the name and two marks. The topic yields first, from the width below
     which it would leave the name no room -->
<template>
  <header v-if="currentRoom" px-2 py-1 flex shrink-0 gap-1 ui-bar items-center>
    <AppDrawerButton label="Show Room List" :meaning="UiIconMeaning.Menu" />
    <UiTooltip v-if="isCreator" #default="{ activatorProps }" label="Edit Room">
      <UiButton
        :="activatorProps"
        :variant="UiButtonVariant.Quiet"
        class="group"
        min-w-0
        @click="isEditRoomDialogOpen = true"
      >
        <MessageContentHeaderRoomTitle :room="currentRoom" />
        <UiIcon :meaning="UiIconMeaning.Edit" op-0 group-focus-visible:op-100 group-hover:op-100 />
      </UiButton>
    </UiTooltip>
    <!-- Only its creator may edit it, so for anyone else the name is only read -->
    <div v-else px-3 flex gap-2 min-w-0 items-center>
      <MessageContentHeaderRoomTitle :room="currentRoom" />
    </div>
    <div flex-1 />
    <div flex shrink-0 gap-1 items-center>
      <template v-if="isDesktop">
        <MessageContentCallButton />
        <MessageContentShowSearchButton />
        <MessageContentShowMemberListButton />
      </template>
      <MessageContentHeaderOverflowMenu />
    </div>
  </header>
  <MessageContentHeaderDirectMessage v-else />
  <MessageContentHeaderEditRoomDialog v-if="currentRoom" :room="currentRoom" />
</template>
