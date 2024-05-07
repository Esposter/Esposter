<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { getScene } from "@/lib/phaser/util/getScene";
import { MENU_DEPTH, MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/scene/world/constants";
import { getMenuHeight } from "@/services/dungeons/scene/world/getMenuHeight";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const sceneKey = useInjectSceneKey();
const worldSceneStore = useWorldSceneStore();
const { isMenuVisible, menuOptionGrid } = storeToRefs(worldSceneStore);
const { primary, border } = useDungeonsColors();
const menuHeight = computed(() => getMenuHeight(menuOptionGrid.value.rowSize));
const x = ref<number>();
const y = ref<number>();

watch(isMenuVisible, (newIsMenuVisible) => {
  if (!newIsMenuVisible) return;

  const scene = getScene(sceneKey);
  x.value = scene.cameras.main.worldView.right - MENU_PADDING * 2 - MENU_WIDTH;
  y.value = scene.cameras.main.worldView.top + MENU_PADDING * 2;
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
      @clickoutside="isMenuVisible = false"
    />
    <DungeonsWorldMenuContent />
  </Container>
</template>
