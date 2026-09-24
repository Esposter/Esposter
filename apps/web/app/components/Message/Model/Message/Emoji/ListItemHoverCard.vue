<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { getReactorNames } from "@/services/message/emoji/getReactorNames";
import { useMemberStore } from "@/store/message/user/member";

interface Props {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<Props>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
const { description } = useEmojiTag(() => emoji.emojiTag);
</script>

<!-- What a reaction's tooltip shows, as Discord does: the emoji large, over who reacted with it -->
<template>
  <span text-center flex flex-col gap-1 max-w-60 items-center>
    <span ui-display><MessageModelMessageEmojiTag :emoji-tag="emoji.emojiTag" /></span>
    <span>
      {{ description }} reacted by <span text-heading-color>{{ getReactorNames(emoji.userIds, getMemberName) }}</span>
    </span>
    <span text-sm text-muted>Right-click for everyone who reacted</span>
  </span>
</template>
