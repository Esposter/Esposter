<script setup lang="ts">
import type { RoomReaction } from "@esposter/db-schema";

import { getReactorNames } from "@/services/message/emoji/getReactorNames";
import { useUserStore } from "@/store/message/user";

interface Props {
  emoji: RoomReaction;
  roomId: string;
}

const { emoji, roomId } = defineProps<Props>();
const userStore = useUserStore();
const { getRoomMemberName } = userStore;
const getReactorName = (userId: string) => getRoomMemberName(roomId, userId);
const { description } = useEmojiTag(() => emoji.emojiTag);
</script>

<!-- What a reaction's tooltip shows, as Discord does: the emoji large, over who reacted with it -->
<template>
  <span text-center flex flex-col gap-1 max-w-60 items-center>
    <span ui-display><MessageModelMessageEmojiTag :emoji-tag="emoji.emojiTag" /></span>
    <span>
      {{ description }} reacted by <span text-heading-color>{{ getReactorNames(emoji.userIds, getReactorName) }}</span>
    </span>
    <span text-sm text-muted>Right-click for everyone who reacted</span>
  </span>
</template>
