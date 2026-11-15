<script setup lang="ts">
import { useLayoutStore } from "#src/store/layout";
import { useMemberStore } from "#src/store/message/user/member";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const memberStore = useMemberStore();
// Titled by its name alone until the server has answered the room's total
const { memberCount } = storeToRefs(memberStore);
</script>

<template>
  <MessageRightSideBarPane
    :title="memberCount === undefined ? 'Members' : `Members — ${memberCount}`"
    is-body-bare
    @close="isRightDrawerOpen = false"
  >
    <MessageModelMemberList />
  </MessageRightSideBarPane>
</template>
