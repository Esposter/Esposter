<script setup lang="ts">
import { checkIsFilterPending } from "#shared/services/message/checkIsFilterPending";
import { SearchFilterComponentMap } from "@/services/message/filter/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, menu } = storeToRefs(searchMessageStore);
// The menu is the field's own dropdown, so it hangs directly below it at exactly its width — a panel wider or
// Narrower than the input reads as a separate surface, and one above it covers the text being typed. Vuetify
// Matches an activator's width only for its own select menus, so the width is measured rather than declared
const activator = useTemplateRef("activator");
const { width } = useElementSize(activator);
</script>

<template>
  <v-menu
    v-model="menu"
    location="bottom"
    :close-on-content-click="false"
    :height="500"
    :open-on-click="false"
    :width
    @mousedown.prevent
  >
    <template #activator="{ props }">
      <div ref="activator">
        <MessageRightSideBarSearchInput :="props" />
      </div>
    </template>
    <StyledCard p-2>
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
        <v-divider mx-4 />
        <MessageRightSideBarSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
