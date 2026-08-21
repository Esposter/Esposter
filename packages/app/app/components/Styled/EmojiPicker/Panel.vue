<script setup lang="ts">
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

import { getEmojiCategories } from "@/services/message/emoji/getEmojiCategories";
import { getPickableEmojiTag } from "@/services/message/emoji/getPickableEmojiTag";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { useEmojiPickerStore } from "@/store/message/emojiPicker";
import { takeOne } from "@esposter/shared";

interface StyledEmojiPickerPanelProps {
  // The room's own uploads, passed in rather than read from a store: this panel is the app's one emoji picker and
  // Knows nothing about rooms — every surface that has a set hands it over
  customEmojis?: CustomEmoji[];
}

const { customEmojis = [] } = defineProps<StyledEmojiPickerPanelProps>();
// The tag leads, because reacting is what most surfaces do with a pick; the record follows for the composer,
// Which needs the content form rather than the reaction form
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
const emojiPickerStore = useEmojiPickerStore();
const { recentEmojiSlugs, skinTone } = storeToRefs(emojiPickerStore);
const { pushRecentEmojiSlug } = emojiPickerStore;
// The panel fills the sheet it arrives in on a phone, and the rail lies along the top so the grid keeps the full
// Width. Focusing the field would raise the keyboard over the emoji the user opened the picker to tap, so it is
// The desktop's alone — on touch, searching is a deliberate tap on the field
const { smAndDown } = useVDisplay();
const searchQuery = ref("");
const previewEmoji = ref<PickableEmoji>();
const categories = computed(() => getEmojiCategories(recentEmojiSlugs.value, customEmojis));
// Tracked by title rather than by index because Frequently Used only appears once there is something in it,
// So an index would silently point at a different category the first time an emoji is picked
const activeCategoryTitle = ref(takeOne(categories.value, 0).title);
// Search replaces the grid wholesale while a query is running. The rail stays live rather than being disabled
// By it — picking a category clears the query, which is the upstream bug that made the two mutually exclusive
const emojis = computed(() => {
  if (searchQuery.value) return searchEmojis(searchQuery.value, customEmojis);
  const activeCategory = categories.value.find(({ title }) => title === activeCategoryTitle.value);
  return (activeCategory ?? takeOne(categories.value, 0)).emojis;
});
</script>

<template>
  <v-card flex flex-col overflow-hidden :class="smAndDown ? 'w-full' : 'w-96'">
    <v-text-field
      v-model="searchQuery"
      density="compact"
      placeholder="Search emoji"
      prepend-inner-icon="mdi-magnify"
      :autofocus="!smAndDown"
      clearable
      hide-details
      ma-2
    />
    <v-divider />
    <!-- The row owns the height so the rail and the grid share it, rather than the taller one growing the card.
         A sheet is measured against the visible viewport, so on a phone that height is a share of it -->
    <div flex min-h-0 :class="smAndDown ? 'flex-col h-[50dvh]' : 'h-96'">
      <StyledEmojiPickerCategoryRail
        v-model="activeCategoryTitle"
        :categories
        :is-horizontal="smAndDown"
        @update:model-value="searchQuery = ''"
      />
      <v-divider :vertical="!smAndDown" />
      <StyledEmojiPickerGrid
        v-if="emojis.length > 0"
        :emojis
        :skin-tone
        @hover="previewEmoji = $event"
        @select="
          (emoji: PickableEmoji) => {
            pushRecentEmojiSlug(emoji.slug);
            emit('select', getPickableEmojiTag(emoji, skinTone), emoji);
          }
        "
      />
      <p v-else m-0 p-4 text-center flex-1 op-medium-emphasis>No results for "{{ searchQuery }}"</p>
    </div>
    <v-divider />
    <StyledEmojiPickerFooter v-model:skin-tone="skinTone" :emoji="previewEmoji" />
  </v-card>
</template>
