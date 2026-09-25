<script setup lang="ts">
import { LEFT_DRAWER_WIDTH, RIGHT_DRAWER_WIDTH } from "#shared/services/app/constants";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { useLayoutStore } from "@/store/layout";

interface Props {
  // The right drawer's content draws its own title and close button, so a narrow screen's sheet draws neither
  isRightTitleHidden?: true;
  // The page scrolls inside its own regions, so it is exactly the viewport tall and the window never scrolls
  isViewportHeight?: true;
  leftDrawerWidth?: number;
  // What the left and right drawers are, the title a narrow screen's sheet shows them under
  leftTitle?: string;
  rightDrawerWidth?: number;
  rightTitle?: string;
}

const slots = defineSlots<{
  default?: () => VNode;
  left?: () => VNode;
  right?: () => VNode;
}>();
const {
  isRightTitleHidden,
  isViewportHeight,
  leftDrawerWidth = LEFT_DRAWER_WIDTH,
  leftTitle = "Navigation",
  rightDrawerWidth = RIGHT_DRAWER_WIDTH,
  rightTitle = "Details",
} = defineProps<Props>();
const { currentRoute } = useRouter();
const layoutStore = useLayoutStore();
const { isDesktop, isLeftDrawerOpen, isLeftDrawerOpenAuto, isRightDrawerOpen, isRightDrawerOpenAuto } =
  storeToRefs(layoutStore);
// A docked drawer is a column of the grid, as wide as the drawer while it is open and none at all while it is closed,
// So the page beside it takes the room as the column animates and nothing has to be offset by hand. A narrow screen's
// Drawers are sheets over the page instead, and take no column
const gridTemplateColumns = computed(() => {
  const leftColumnWidth = slots.left && isDesktop.value && isLeftDrawerOpen.value ? leftDrawerWidth : 0;
  const rightColumnWidth = slots.right && isDesktop.value && isRightDrawerOpen.value ? rightDrawerWidth : 0;
  return `${leftColumnWidth}px minmax(0, 1fr) ${rightColumnWidth}px`;
});
// A narrow screen's drawer is a sheet over the page, and a page picked from it is what it was opened for
watch(
  () => currentRoute.value.fullPath,
  () => {
    if (isDesktop.value) return;
    isLeftDrawerOpen.value = isRightDrawerOpen.value = false;
  },
);

onMounted(() => {
  // A wide screen docks every drawer the page has, open, and a narrow one keeps them closed behind their buttons
  watchImmediate(isDesktop, (newIsDesktop) => {
    isLeftDrawerOpen.value = isLeftDrawerOpenAuto.value = slots.left ? newIsDesktop : false;
    isRightDrawerOpen.value = isRightDrawerOpenAuto.value = slots.right ? newIsDesktop : false;
  });
});
</script>

<!-- The shell starts past the dock, and each region is placed by its column rather than by its order, since a page may
     have either drawer or neither. A docked drawer holds its content at the drawer's full width, so closing clips it
     toward the edge it docks on rather than squeezing it, and it stays in view while the window scrolls the page. Its
     clip reaches a step past its edge while it is open, where a resize handle straddles the border -->
<template>
  <div
    class="shell"
    :class="isViewportHeight ? 'h-dvh' : 'flex-1'"
    :style="{ gridTemplateColumns }"
    pb="[var(--dock-inset-block-end)]"
    pl="[var(--dock-inset-inline-start)]"
    grid
    rows="[minmax(0,1fr)]"
  >
    <template v-if="slots.left">
      <aside
        v-if="isDesktop"
        :class="{ '[overflow-clip-margin:var(--ui-step)]': isLeftDrawerOpen }"
        :inert="!isLeftDrawerOpen"
        h="[calc(100dvh-var(--dock-inset-block-end))]"
        flex
        col-start-1
        row-start-1
        self-start
        top-0
        sticky
        of-clip
        ui-frame
      >
        <div :style="{ width: `${leftDrawerWidth}px` }" flex shrink-0 flex-col>
          <slot name="left" />
        </div>
      </aside>
      <UiDialog v-else v-model="isLeftDrawerOpen" :placement="UiDialogPlacement.DrawerStart" :title="leftTitle">
        <div flex flex-1 flex-col min-h-0>
          <slot name="left" />
        </div>
      </UiDialog>
    </template>
    <main col-start-2 row-start-1 min-h-0 min-w-0>
      <slot />
    </main>
    <template v-if="slots.right">
      <aside
        v-if="isDesktop"
        :class="{ '[overflow-clip-margin:var(--ui-step)]': isRightDrawerOpen }"
        :inert="!isRightDrawerOpen"
        h="[calc(100dvh-var(--dock-inset-block-end))]"
        flex
        col-start-3
        row-start-1
        self-start
        top-0
        justify-end
        sticky
        of-clip
        ui-frame
      >
        <div :style="{ width: `${rightDrawerWidth}px` }" flex shrink-0 flex-col>
          <slot name="right" />
        </div>
      </aside>
      <UiDialog
        v-else
        v-model="isRightDrawerOpen"
        :is-title-hidden="isRightTitleHidden"
        :placement="UiDialogPlacement.DrawerEnd"
        :title="rightTitle"
      >
        <div flex flex-1 flex-col min-h-0>
          <slot name="right" />
        </div>
      </UiDialog>
    </template>
  </div>
</template>

<style scoped>
.shell {
  transition: grid-template-columns var(--ui-motion-medium);
}
</style>
