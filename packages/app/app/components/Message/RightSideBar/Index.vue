<script setup lang="ts">
import { RightDrawer } from "@/services/message/RightDrawer";
import { useLayoutStore } from "@/store/message/layout";
import { useSearchMessageStore } from "@/store/message/searchMessage";

const layoutStore = useLayoutStore();
const { rightDrawer } = storeToRefs(layoutStore);
const searchMessageStore = useSearchMessageStore();
const { isSearching } = storeToRefs(searchMessageStore);
</script>

<template>
  <template v-if="isSearching || rightDrawer === RightDrawer.Search">
    <MessageRightSideBarSearchHeader />
    <v-divider />
    <MessageRightSideBarSearchMessages v-if="rightDrawer === RightDrawer.Search" />
  </template>
  <template v-else>
    <MessageRightSideBarMemberHeader />
    <v-divider />
    <MessageRightSideBarMemberList />
  </template>
</template>
