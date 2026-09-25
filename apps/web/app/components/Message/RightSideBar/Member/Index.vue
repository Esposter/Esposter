<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";
import { useMemberStore } from "@/store/message/user/member";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const memberStore = useMemberStore();
const { memberCount } = storeToRefs(memberStore);
</script>

<template>
  <MessageRightSideBarHeader :title="`Members — ${memberCount}`" @close="isRightDrawerOpen = false" />
  <MessageModelMemberList of-y-auto />
</template>
