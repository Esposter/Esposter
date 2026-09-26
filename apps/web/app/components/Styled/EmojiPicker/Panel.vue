<script setup lang="ts">
import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { PickableEmoji } from "@/models/message/emoji/PickableEmoji";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getEmojiCategories } from "@/services/message/emoji/getEmojiCategories";
import { getPickableEmojiTag } from "@/services/message/emoji/getPickableEmojiTag";
import { searchEmojis } from "@/services/message/emoji/searchEmojis";
import { useLayoutStore } from "@/store/layout";
import { useEmojiPickerStore } from "@/store/message/emojiPicker";
import { takeOne } from "@esposter/shared";

interface Props {
  // The room's own uploads, passed in rather than read from a store: this panel is the app's one emoji picker and
  // Knows nothing about rooms — every surface that has a set hands it over
  customEmojis?: CustomEmoji[];
}

defineSlots<{ footer?: () => VNode }>();
const { customEmojis = [] } = defineProps<Props>();
// The tag leads, because reacting is what most surfaces do with a pick; the record follows for the composer,
// Which needs the content form rather than the reaction form
const emit = defineEmits<{ select: [emojiTag: string, emoji: PickableEmoji] }>();
// A touch screen's field waits for a tap: focusing it would raise the keyboard over the emoji the reader opened it to tap
const layoutStore = useLayoutStore();
const { isTouchScreen } = storeToRefs(layoutStore);
const emojiPickerStore = useEmojiPickerStore();
const { recentEmojiSlugs, skinTone } = storeToRefs(emojiPickerStore);
const { createRecentEmojiSlug } = emojiPickerStore;
const searchQuery = ref("");
const previewEmoji = ref<PickableEmoji>();
const categories = computed(() => getEmojiCategories(recentEmojiSlugs.value, customEmojis));
// Tracked by title rather than by index because Frequently Used only appears once there is something in it,
// So an index would silently point at a different category the first time an emoji is picked
const pickedCategoryTitle = ref(takeOne(categories.value).title);
// A category can leave the rail while it is the selected one — a room's set going empty takes its category with
// It — so the pick is resolved against the live list rather than trusted, and the rail never marks a category
// That is gone above a grid that had already fallen back
const activeCategory = computed(
  () => categories.value.find(({ title }) => title === pickedCategoryTitle.value) ?? takeOne(categories.value),
);
const activeCategoryTitle = computed({
  get: () => activeCategory.value.title,
  set: (title) => {
    pickedCategoryTitle.value = title;
  },
});
// Search replaces the grid wholesale while a query is running. The rail stays live rather than being disabled
// By it — picking a category clears the query, which is the upstream bug that makes the two mutually exclusive
const emojis = computed(() =>
  searchQuery.value ? searchEmojis(searchQuery.value, customEmojis) : activeCategory.value.emojis,
);
</script>

<!-- As wide and as tall as the screen leaves room for, so the one panel fits a phone and a desktop alike -->
<template>
  <div w="[min(24rem,calc(100dvw-2rem))]" flex flex-col gap-2 min-h-0>
    <UiTextField
      v-model="searchQuery"
      :is-autofocus="isTouchScreen ? undefined : true"
      label="Search emoji"
      :type="UiTextFieldType.Search"
    />
    <!-- The row owns the height so the rail and the grid share it, rather than the taller one growing the panel -->
    <div h="[min(24rem,40dvh)]" flex gap-1 min-h-0>
      <StyledEmojiPickerCategoryRail v-model="activeCategoryTitle" :categories @update:model-value="searchQuery = ''" />
      <StyledEmojiPickerGrid
        v-if="emojis.length > 0"
        :emojis
        :skin-tone
        @hover="previewEmoji = $event"
        @select="
          (emoji: PickableEmoji) => {
            createRecentEmojiSlug(emoji.slug);
            emit('select', getPickableEmojiTag(emoji, skinTone), emoji);
          }
        "
      />
      <UiEmptyState
        v-else
        :description="`Nothing matches “${searchQuery}”.`"
        flex-1
        :meaning="UiIconMeaning.Search"
        title="No results"
      />
    </div>
    <StyledEmojiPickerFooter v-model:skin-tone="skinTone" :emoji="previewEmoji">
      <slot name="footer" />
    </StyledEmojiPickerFooter>
  </div>
</template>
