<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { RoomInMessage } from "@esposter/db-schema";

import { RoutePath } from "@esposter/shared";

interface Props {
  // The room's actions, which a right-click, a long press or the menu key opens on the row
  contextMenuItems: Item[];
  image?: RoomInMessage["image"];
  isActive: boolean;
  // Something new waits in it, so its name reads in the text colour rather than the muted one every quiet room takes
  isUnread?: true;
  name: string;
  roomId: RoomInMessage["id"];
}

defineSlots<{ actions?: () => VNode; append?: () => VNode }>();
const { contextMenuItems, image, isActive, isUnread, name, roomId } = defineProps<Props>();
const { getContextMenuProps } = useContextMenu();
const contextMenuProps = getContextMenuProps(roomId, () => contextMenuItems);
</script>

<!-- Discord's channel row: the name muted until something waits in it or it is the room being read, its readings at
     the end, and its actions beside it once it is hovered, focused or open. The actions sit beside the link rather than
     inside it, so pressing one never follows the row -->
<template>
  <div class="group" flex items-center>
    <NuxtInvisibleLink
      :="contextMenuItems.length > 0 ? contextMenuProps : {}"
      :aria-current="isActive ? 'page' : undefined"
      :class="{ 'text-muted': !isActive && !isUnread }"
      :to="RoutePath.Messages(roomId)"
      ui-item
      flex-1
      min-w-0
      hover:text-text
    >
      <UiItemContent :image="image ?? ''" :title="name">
        <template v-if="$slots.append" #append><slot name="append" /></template>
      </UiItemContent>
    </NuxtInvisibleLink>
    <div v-if="$slots.actions" :class="{ 'op-100': isActive }" op-0 flex group-focus-within:op-100 group-hover:op-100>
      <slot name="actions" />
    </div>
  </div>
</template>
