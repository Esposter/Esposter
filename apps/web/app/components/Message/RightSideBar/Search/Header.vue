<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useSearchMessageStore } from "@/store/message/search";

const searchMessageStore = useSearchMessageStore();
const { count, isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <header p-2 flex flex-col gap-2 ui-bar>
    <MessageRightSideBarSearchInput />
    <div text-sm text-muted px-2 flex gap-2 h-6 items-center>
      <template v-if="isSearching">
        <UiSpinner />
        Searching
      </template>
      <template v-else>
        <span flex-1 truncate>{{ count }} {{ pluralize("result", count) }}</span>
        <UiTooltip #default="{ activatorProps }" label="New messages may take up to 5 minutes to appear.">
          <UiIcon :="activatorProps" label="About search results" :meaning="UiIconMeaning.Info" tabindex="0" />
        </UiTooltip>
      </template>
    </div>
  </header>
</template>
