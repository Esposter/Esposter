<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/scene/monsterParty/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { useInputStore } from "@/lib/phaser/store/input";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { DEFAULT_INFO_DIALOG_MESSAGE } from "@/services/dungeons/scene/monsterParty/constants";
import { useDialogStore } from "@/store/dungeons/dialog";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Input } from "phaser";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
// It's unfortunate, but we have to access the internals
// when we handle confirm inputs since we don't know where it comes from
// i.e. it could be from this info container or from clicking the monster panel
const dialogStore = useDialogStore();
const { isWaitingForPlayerSpecialInput } = storeToRefs(dialogStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { monsterPartyOptionGrid } = storeToRefs(monsterPartySceneStore);
const infoPanelStore = useInfoPanelStore();
const { infoDialogMessage, infoTextDisplayWidth } = storeToRefs(infoPanelStore);
const rectangleHeight = 65;
const cancelButtonActive = computed(() => monsterPartyOptionGrid.value.value === PlayerSpecialInput.Cancel);
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
      @update:display-width="(value: typeof infoTextDisplayWidth) => (infoTextDisplayWidth = value)"
    />
    <DungeonsUIInputPromptCursor :y="rectangleHeight / 2 - 3" />
  </Container>
</template>
