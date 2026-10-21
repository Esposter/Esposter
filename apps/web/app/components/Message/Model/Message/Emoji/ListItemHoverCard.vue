<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { getReactorNames } from "@/services/message/emoji/getReactorNames";
import { useUserStore } from "@/store/message/user";

interface Props {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<Props>();
const userStore = useUserStore();
const { getRoomMemberMap } = userStore;
const { userMap } = storeToRefs(userStore);
// A reactor with no membership in the room is named by the account
const getReactorName = (userId: string) =>
  getRoomMemberMap(emoji.partitionKey)?.get(userId)?.displayName ?? userMap.value.get(userId)?.name ?? "";
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
