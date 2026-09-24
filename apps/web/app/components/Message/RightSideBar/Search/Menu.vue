<script setup lang="ts">
import { checkIsFilterPending } from "#shared/services/message/checkIsFilterPending";
import { SearchFilterComponentMap } from "@/services/message/filter/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, isMenuOpen } = storeToRefs(searchMessageStore);
// The menu is the field's own dropdown, so it hangs directly below it at exactly its width — a panel wider or
// Narrower than the input reads as a separate surface, and one above it covers the text being typed. Vuetify
// Matches an activator's width only for its own select menus, so the width is measured rather than declared.
// @TODO: a library panel anchored to a field it keeps focus in, the way suggestions are, replaces the Vuetify menu and
// The field (ui-library gap: a token field and its panel)
const activator = useTemplateRef("activator");
const { width } = useElementSize(activator);
</script>

<template>
  <v-menu
    v-model="isMenuOpen"
    location="bottom"
    :close-on-content-click="false"
    height="31.25rem"
    :open-on-click="false"
    :width
    @mousedown.prevent
  >
    <template #activator="{ props }">
      <div ref="activator">
        <MessageRightSideBarSearchInput :="props" />
      </div>
    </template>
    <div p-2 flex flex-col gap-2 h-full of-y-auto ui-lifted ui-body>
      <component
        :is="SearchFilterComponentMap[activeSelectedFilter.type]"
        v-if="activeSelectedFilter && checkIsFilterPending(activeSelectedFilter)"
        @select="
          (value) => {
            if (!activeSelectedFilter) return;
            activeSelectedFilter.value = value;
          }
        "
      />
      <template v-else>
        <MessageRightSideBarSearchOptions />
        <MessageRightSideBarSearchHistory />
      </template>
    </div>
  </v-menu>
</template>
