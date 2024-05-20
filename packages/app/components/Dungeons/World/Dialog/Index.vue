<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import { onShowMessage } from "@/lib/phaser/hooks/onShowMessage";
import { useInputStore } from "@/lib/phaser/store/input";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DIALOG_DEPTH, DIALOG_HEIGHT, DIALOG_PADDING, DIALOG_WIDTH } from "@/services/dungeons/scene/world/constants";
import { useWorldDialogStore } from "@/store/dungeons/world/dialog";
import { Input } from "phaser";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const worldDialogStore = useWorldDialogStore();
const { isDialogVisible, dialogMessage } = storeToRefs(worldDialogStore);
const x = ref<number>();
const y = ref<number>();

onShowMessage((scene) => {
  x.value = scene.cameras.main.worldView.x + DIALOG_PADDING;
  y.value = scene.cameras.main.worldView.bottom - DIALOG_HEIGHT - DIALOG_PADDING / 4;
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
