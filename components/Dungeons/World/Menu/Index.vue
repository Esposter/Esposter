<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { MENU_DEPTH, MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/world/constants";
import { getMenuHeight } from "@/services/dungeons/world/getMenuHeight";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
const { primary, border } = useDungeonsColors();
const worldView = useWorldView();
const x = ref(worldView.value.right - MENU_PADDING * 2 - MENU_WIDTH);
const y = ref(worldView.value.top + MENU_PADDING * 2);
const menuHeight = computed(() => getMenuHeight(menuOptionGrid.value.rowSize));

watch(isMenuVisible, (newIsMenuVisible) => {
  if (!newIsMenuVisible) return;

  x.value = worldView.value.right - MENU_PADDING * 2 - MENU_WIDTH;
  y.value = worldView.value.top + MENU_PADDING * 2;
});
</script>

<template>
  <Container :configuration="{ visible: isMenuVisible, x, y, depth: MENU_DEPTH }">
    <Rectangle
      :configuration="{
        x: 1,
        width: MENU_WIDTH - 1,
        height: menuHeight - 1,
        origin: 0,
        fillColor: primary,
        alpha: 0.9,
        strokeStyle: [8, border],
      }"
    />
    <DungeonsWorldMenuContent />
  </Container>
</template>
