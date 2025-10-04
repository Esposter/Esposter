<script setup lang="ts">
import { FileEntityPropertyNames } from "#shared/models/azure/FileEntity";
import { MessageEntityPropertyNames } from "#shared/models/db/message/MessageEntity";
import { FilterType } from "#shared/models/message/FilterType";
import { FilterTypeHas } from "#shared/models/message/FilterTypeHas";
import { SearchFilterComponentMap } from "@/services/message/SearchFilterComponentMap";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const searchMessageStore = useSearchMessageStore();
const { activeSelectedFilter, menu } = storeToRefs(searchMessageStore);
</script>

<template>
  <v-menu
    v-model="menu"
    location="top"
    :close-on-content-click="false"
    :height="500"
    :open-on-click="false"
    @mousedown.prevent
  >
    <template #activator="{ props }">
      <MessageContentSearchInput :="props" />
    </template>
    <StyledCard p-2>
      <component
        :is="SearchFilterComponentMap[activeSelectedFilter.type]"
        v-if="
          activeSelectedFilter && !activeSelectedFilter.value && SearchFilterComponentMap[activeSelectedFilter.type]
        "
        @select="
          (value: string) => {
            if (!activeSelectedFilter) return;
            activeSelectedFilter.value = value;

            if (activeSelectedFilter.type === FilterType.Has)
              switch (value) {
                case FilterTypeHas.Link:
                case FilterTypeHas.Embed:
                  activeSelectedFilter.key = MessageEntityPropertyNames.linkPreviewResponse;
                  break;
                case FilterTypeHas.Image:
                  activeSelectedFilter.key = `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`;
                  break;
                case FilterTypeHas.Video:
                  activeSelectedFilter.key = `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`;
                  break;
                case FilterTypeHas.Sound:
                  activeSelectedFilter.key = `${MessageEntityPropertyNames.files}/${FileEntityPropertyNames.mimetype}`;
                  break;
                case FilterTypeHas.Forward:
                  activeSelectedFilter.key = MessageEntityPropertyNames.isForward;
                  break;
              }
          }
        "
      />
      <template v-else>
        <MessageContentSearchOptions />
        <v-divider mx-4 />
        <MessageContentSearchHistory />
      </template>
    </StyledCard>
  </v-menu>
</template>
