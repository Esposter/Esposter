<script setup lang="ts">
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

import { authClient } from "@/services/auth/authClient";
import { useMessageDialogStore } from "@/store/message/dialog";
import { useEmojiStore } from "@/store/message/emoji";

interface Props {
  emoji: MessageEmojiMetadataEntity;
}

const { emoji } = defineProps<Props>();
// Rendered inside a `v-for`, so the bare form keeps this component synchronous rather than suspending the list
const session = authClient.useSession();
const messageDialogStore = useMessageDialogStore();
const { reactionsRowKey } = storeToRefs(messageDialogStore);
const emojiStore = useEmojiStore();
const { toggleEmoji } = emojiStore;
const isReacted = computed(() => {
  const userId = session.value.data?.user.id;
  return Boolean(userId && emoji.userIds.includes(userId));
});
</script>

<template>
  <!-- A hover card rather than a tooltip: its content is clickable, which a tooltip's never is -->
  <v-menu location="top" open-on-hover>
    <template #activator="{ props: menuProps }">
      <button
        :="menuProps"
        :class="
          isReacted
            ? ['bg-info-opacity-10', 'b-info']
            : ['bg-background-opacity-80', 'b-transparent', 'hover:bg-surface-opacity-80', 'hover:b-border']
        "
        px-2
        b-1
        rd-full
        b-solid
        flex
        w-fit
        cursor-pointer
        shadow-md
        origin-center
        items-center
        z-1
        active:scale-95
        type="button"
        @click="toggleEmoji(emoji)"
      >
        <MessageModelMessageEmojiTag :emoji-tag="emoji.emojiTag" />
        <span pl-1 text-title-small>{{ emoji.userIds.length }}</span>
      </button>
    </template>
    <MessageModelMessageEmojiListItemHoverCard :emoji @open="reactionsRowKey = emoji.messageRowKey" />
  </v-menu>
</template>
