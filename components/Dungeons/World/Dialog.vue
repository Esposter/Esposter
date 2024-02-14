<script setup lang="ts">
import { DialogTextStyle } from "@/assets/dungeons/styles/DialogTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { DIALOG_DEPTH, DIALOG_HEIGHT, DIALOG_PADDING, DIALOG_WIDTH } from "@/services/dungeons/world/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldSceneStore = useWorldSceneStore();
const { isDialogVisible, dialogText } = storeToRefs(worldSceneStore);
const worldView = computed(() => scene.value.cameras.main.worldView);
const x = ref(worldView.value.x + DIALOG_PADDING);
const y = ref(worldView.value.bottom - DIALOG_HEIGHT - DIALOG_PADDING / 4);

usePhaserListener("showMessage", () => {
  isDialogVisible.value = true;
});

watch(isDialogVisible, (newIsDialogVisible) => {
  if (!newIsDialogVisible) return;

  x.value = worldView.value.x + DIALOG_PADDING;
  y.value = worldView.value.bottom - DIALOG_HEIGHT - DIALOG_PADDING / 4;
});
</script>

<template>
  <Container
    v-if="isDialogVisible"
    :configuration="{ x, y, depth: DIALOG_DEPTH }"
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="controls.setInput(PlayerSpecialInput.Confirm)"
  >
    <Rectangle
      :configuration="{
        width: DIALOG_WIDTH,
        height: DIALOG_HEIGHT,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
        origin: 0,
      }"
    />
    <Text
      :configuration="{
        x: 18,
        y: 12,
        text: dialogText,
        style: {
          ...DialogTextStyle,
          wordWrap: { width: DIALOG_WIDTH - 18 },
        },
      }"
    />
    <DungeonsInputPromptCursor :height="DIALOG_HEIGHT - 24" :scale="2" />
  </Container>
</template>
