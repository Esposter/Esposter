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
// Access internals on confirm: the input source is ambiguous (this container or the monster panel).
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

watchImmediate(cancelButtonActive, (newCancelButtonActive) => {
  // Info text stays a ref since other things set it (e.g. using items).
  infoDialogMessage.value.text = newCancelButtonActive ? "Go back to previous menu." : DEFAULT_INFO_DIALOG_MESSAGE;
});
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
          // Disambiguate two input sources, active only while waiting for player special input:
          // 1. Monster panel item input
          // 2. Info panel input (this component)
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
      @update:display-width="infoTextDisplayWidth = $event"
    />
    <DungeonsUIInputPromptCursor :y="rectangleHeight / 2 - 3" />
  </Container>
</template>
