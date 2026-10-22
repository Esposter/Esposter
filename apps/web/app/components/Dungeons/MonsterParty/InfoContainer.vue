<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/monsterParty/styles/MenuTextStyle";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE, INFO_CONTAINER_HEIGHT } from "@/services/dungeons/scene/monsterParty/constants";
import { PANEL_BORDER_COLOR, PANEL_FILL_COLOR } from "@/services/dungeons/UI/constants";
import { useControlsStore } from "@/store/dungeons/controls";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useMonsterPartyInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { Input } from "phaser";
import { Container, onCreate, Rectangle, Text } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
// Access internals on confirm: the input source is ambiguous (this container or the monster panel).
const dialogStore = useDialogStore();
const { isWaitingForPlayerSpecialInput } = storeToRefs(dialogStore);
const monsterPartyOptionGrid = useMonsterPartyOptionGrid();
const monsterPartyInfoPanelStore = useMonsterPartyInfoPanelStore();
const { infoDialogMessage, infoTextDisplayWidth } = storeToRefs(monsterPartyInfoPanelStore);
const isCancelButtonActive = computed(() => monsterPartyOptionGrid.value === PlayerSpecialInput.Cancel);
const y = ref<number>();

onCreate((scene) => {
  y.value = scene.scale.height - 69;
});

watchImmediate(isCancelButtonActive, (newIsCancelButtonActive) => {
  // Info text stays a ref since other things set it (e.g. using items).
  infoDialogMessage.value.text = newIsCancelButtonActive ? "Go back to previous menu." : DEFAULT_INFO_DIALOG_MESSAGE;
});
</script>

<template>
  <Container :configuration="{ x: 4, y }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 867,
        height: INFO_CONTAINER_HEIGHT,
        fillColor: PANEL_FILL_COLOR,
        strokeStyle: [8, PANEL_BORDER_COLOR],
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
      :configuration="{ x: 15, y: 14, text: infoDialogMessage.text, style: MenuTextStyle }"
      @update:display-width="infoTextDisplayWidth = $event"
    />
    <DungeonsUIInputPromptCursor :y="INFO_CONTAINER_HEIGHT / 2 - 3" />
  </Container>
</template>
