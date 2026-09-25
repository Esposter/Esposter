<script setup lang="ts">
import { LEFT_DRAWER_WIDTH, PAGE_TITLE_SEPARATOR, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { MAX_SIDE_BAR_WIDTH, MIN_SIDE_BAR_WIDTH } from "@/services/message/ui/constants";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useMessageLayoutStore } from "@/store/message/ui/layout";

useHead({
  titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME}${PAGE_TITLE_SEPARATOR}${title}` : MESSAGE_DISPLAY_NAME),
});
await useSubscribables();

const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
const messageLayoutStore = useMessageLayoutStore();
const { leftSideBarWidth, rightSideBarWidth, splitRightDrawer } = storeToRefs(messageLayoutStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
const leftDrawerWidth = computed(() => (isDesktop.value ? leftSideBarWidth.value : LEFT_DRAWER_WIDTH));
const rightDrawerWidth = computed(() => {
  if (!isDesktop.value) return RIGHT_DRAWER_WIDTH;
  else if (splitRightDrawer.value) return rightSideBarWidth.value * 2;
  else return rightSideBarWidth.value;
});
</script>

<!-- Split view puts two panes in the one drawer, so the drawer is twice as wide — the handle still resizes one
     pane's worth, which is what keeps both halves equal at any width -->
<template>
  <NuxtLayout
    :footer-style="{ paddingBottom: 0 }"
    hide-global-scrollbar
    :left-drawer-width
    left-title="Rooms"
    :right-drawer-width
  >
    <Head>
      <Title>{{ roomName }}</Title>
    </Head>
    <MessageContent />
    <template #left>
      <MessageLeftSideBar />
      <UiResizeHandle
        v-if="isDesktop"
        v-model="leftSideBarWidth"
        label="Resize rooms"
        :max="MAX_SIDE_BAR_WIDTH"
        :min="MIN_SIDE_BAR_WIDTH"
      />
    </template>
    <template #right>
      <MessageRightSideBar />
      <UiResizeHandle
        v-if="isDesktop"
        v-model="rightSideBarWidth"
        is-reversed
        label="Resize the side panel"
        :max="MAX_SIDE_BAR_WIDTH"
        :min="MIN_SIDE_BAR_WIDTH"
      />
    </template>
    <template #footer>
      <div w-full>
        <MessageContentMobileActionBar />
        <MessageModelMessageInput />
      </div>
    </template>
  </NuxtLayout>
</template>
