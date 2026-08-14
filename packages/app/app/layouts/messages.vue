<script setup lang="ts">
import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { MAX_SIDE_BAR_WIDTH, MIN_SIDE_BAR_WIDTH } from "@/services/message/ui/constants";
import { useLayoutStore } from "@/store/layout";
import { useRoomStore } from "@/store/message/room";
import { useMessageLayoutStore } from "@/store/message/ui/layout";

useHead({ titleTemplate: (title) => (title ? `${MESSAGE_DISPLAY_NAME} | ${title}` : MESSAGE_DISPLAY_NAME) });
await useSubscribables();

const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
const messageLayoutStore = useMessageLayoutStore();
const { leftSideBarWidth, rightSideBarWidth, splitRightDrawer } = storeToRefs(messageLayoutStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const roomName = useRoomName(currentRoomId);
</script>

<!-- Split view puts two panes in the one drawer, so the drawer is twice as wide — the handle still resizes one
     pane's worth, which is what keeps both halves equal at any width -->
<template>
  <NuxtLayout
    :footer-style="{ paddingBottom: 0 }"
    hide-global-scrollbar
    :left-navigation-drawer-props="{ width: isDesktop ? leftSideBarWidth : LEFT_DRAWER_WIDTH }"
    :right-navigation-drawer-props="{
      width: isDesktop ? (splitRightDrawer ? rightSideBarWidth * 2 : rightSideBarWidth) : RIGHT_DRAWER_WIDTH,
    }"
  >
    <Head>
      <Title>{{ roomName }}</Title>
    </Head>
    <MessageContent />
    <template #left>
      <MessageLeftSideBar />
      <StyledResizeHandle
        v-if="isDesktop"
        v-model="leftSideBarWidth"
        :max="MAX_SIDE_BAR_WIDTH"
        :min="MIN_SIDE_BAR_WIDTH"
      />
    </template>
    <template #right>
      <MessageRightSideBar />
      <StyledResizeHandle
        v-if="isDesktop"
        v-model="rightSideBarWidth"
        is-reversed
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
