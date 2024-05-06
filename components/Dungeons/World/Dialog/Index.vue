<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShowMessage } from "@/lib/phaser/hooks/onShowMessage";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DIALOG_DEPTH, DIALOG_HEIGHT, DIALOG_PADDING, DIALOG_WIDTH } from "@/services/dungeons/scene/world/constants";
import { useGameStore } from "@/store/dungeons/game";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Input } from "phaser";

const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const worldDialogStore = useWorldDialogStore();
const { isDialogVisible, dialogMessage } = storeToRefs(worldDialogStore);
const x = ref<number>();
const y = ref<number>();

onCreate((scene) => {
  x.value = scene.cameras.main.worldView.x + DIALOG_PADDING;
  y.value = scene.cameras.main.worldView.bottom - DIALOG_HEIGHT - DIALOG_PADDING / 4;
});

onShowMessage(() => {
  isDialogVisible.value = true;
});
</script>

<template>
  <Container :configuration="{ visible: isDialogVisible, x, y, depth: DIALOG_DEPTH }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: DIALOG_WIDTH,
        height: DIALOG_HEIGHT,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="controls.setInput(PlayerSpecialInput.Confirm)"
    />
    <DungeonsWorldDialogText :dialog-message="dialogMessage" />
    <DungeonsUIInputPromptCursor :y="DIALOG_HEIGHT - 24" :scale="1.25" />
  </Container>
</template>
