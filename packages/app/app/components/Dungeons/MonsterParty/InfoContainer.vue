<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/monsterParty/styles/MenuTextStyle";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { useControlsStore } from "@/store/dungeons/controls";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { Input } from "phaser";
import { Container, onCreate, Rectangle, Text } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
// It's unfortunate, but we have to access the internals
// when we handle confirm inputs since we don't know where it comes from
// i.e. it could be from this info container or from clicking the monster panel
const dialogStore = useDialogStore();
const { isWaitingForPlayerSpecialInput } = storeToRefs(dialogStore);
const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
const infoPanelStore = useInfoPanelStore();
const { infoDialogMessage, infoTextDisplayWidth } = storeToRefs(infoPanelStore);
const rectangleHeight = 65;
const cancelButtonActive = computed(() => monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel);
const y = ref<number>();

onCreate((scene) => {
  y.value = scene.scale.height - 69;
});

watch(
  cancelButtonActive,
  (newCancelButtonActive) => {
    // We will keep info text as a ref as it can be set by other things
    // e.g. when using items
    infoDialogMessage.value.text = newCancelButtonActive ? "Go back to previous menu." : DEFAULT_INFO_DIALOG_MESSAGE;
  },
  { immediate: true },
);
</script>

<template>
  <Container :configuration="{ x: 4, y }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 867,
        height: rectangleHeight,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="
        () => {
          // We have multiple possible input sources that we have to disambiguate:
          // 1. Monster Panel Item Input
          // 2. Info Panel Input (this component)
          // and this is only active when we are waiting for player special input
          if (isWaitingForPlayerSpecialInput) controls.setInput(PlayerSpecialInput.Confirm);
        }
      "
    />
    <Text
      :configuration="{
        x: 15,
        y: 14,
        text: infoDialogMessage.text,
        style: MenuTextStyle,
      }"
      @update:display-width="(value) => (infoTextDisplayWidth = value)"
    />
    <DungeonsUIInputPromptCursor :y="rectangleHeight / 2 - 3" />
  </Container>
</template>
