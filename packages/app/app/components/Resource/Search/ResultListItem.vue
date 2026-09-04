<script setup lang="ts">
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { getResourceSearchOptionId } from "@/services/resource/search/getResourceSearchOptionId";

interface Props {
  index: number;
  isActive: boolean;
  item: ResourceSearchItem;
  searchQuery: string;
}

const { index, isActive, item, searchQuery } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<!-- A real link, not a click handler: middle-click and ctrl/cmd-click must open a background tab rather
     than replace the page the user is on, and "Copy link address" and the hover preview come with the href -->
<template>
  <v-list-item
    :id="getResourceSearchOptionId(index)"
    :active="isActive"
    :prepend-icon="item.icon"
    role="option"
    :subtitle="item.subtitle"
    :to="item.to"
    @click="emit('select')"
  >
    <template #title>
      <ResourceSearchHighlightedTitle :search-query :text="item.title" />
    </template>
    <!-- Stays imperative: the row is an anchor now, and an anchor inside an anchor is invalid markup -->
    <template v-if="item.createTo" #append>
      <StyledLinkRowActions>
        <StyledTooltipIconButton
          icon="mdi-plus"
          text="Create"
          :button-props="{ size: 'small', variant: 'text' }"
          @click="
            async () => {
              await navigateTo(item.createTo);
              emit('select');
            }
          "
        />
      </StyledLinkRowActions>
    </template>
  </v-list-item>
</template>
