<script setup lang="ts">
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { useLayoutStore } from "#src/store/layout";

interface Props {
  // The right drawer's content draws its own title and close button, so a narrow screen's sheet draws neither
  isTitleHidden?: true | undefined;
  // The edge the drawer docks on: the start edge is the left drawer, the end edge the right one
  placement: typeof UiDialogPlacement.DrawerEnd | typeof UiDialogPlacement.DrawerStart;
  // What the drawer is, the title a narrow screen's sheet shows it under
  title: string;
  // The width a docked drawer holds its content at, which is also the column the page beside it gives up for it
  width: number;
}

defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
const layoutStore = useLayoutStore();
const { isDesktop } = storeToRefs(layoutStore);
</script>

<!-- A wide screen docks the drawer as a column of the page's grid, open or closed, in the column its edge names. A narrow
     screen shows the same content as a sheet over the page instead -->
<template>
  <aside
    v-if="isDesktop"
    :class="[
      placement === UiDialogPlacement.DrawerStart ? 'col-start-1' : 'col-start-3 justify-end',
      { '[overflow-clip-margin:var(--ui-step)]': isOpen },
    ]"
    :inert="!isOpen"
    h="[calc(100dvh-var(--dock-inset-block-end))]"
    flex
    row-start-1
    self-start
    top-0
    sticky
    of-clip
    ui-frame
  >
    <div :style="{ width: `${width}px` }" flex shrink-0 flex-col>
      <slot />
    </div>
  </aside>
  <UiDialog v-else v-model="isOpen" is-body-bare :is-title-hidden :placement :title>
    <slot />
  </UiDialog>
</template>
