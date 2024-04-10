<script setup lang="ts">
import { MenuTextStyle } from "@/assets/dungeons/monsterParty/styles/MenuTextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { useInfoPanelStore } from "@/store/dungeons/monsterParty/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const monsterPartySceneStore = useMonsterPartySceneStore();
const { optionGrid } = storeToRefs(monsterPartySceneStore);
const infoPanelStore = useInfoPanelStore();
const { infoDialogMessage } = storeToRefs(infoPanelStore);
const cancelButtonActive = computed(() => optionGrid.value.value === PlayerSpecialInput.Cancel);

watch(
  cancelButtonActive,
  (newCancelButtonActive) => {
    // We will keep info text as a ref as it can be set by other things
    // e.g. when using items
    infoDialogMessage.value.text = newCancelButtonActive ? "Go back to previous menu" : "Choose a monster";
  },
  { immediate: true },
);
</script>

<template>
  <Container :configuration="{ x: 4, y: scene.scale.height - 69 }">
    <Rectangle
      :configuration="{
        origin: 0,
        width: 867,
        height: 65,
        fillColor: 0xede4f3,
        strokeStyle: [8, 0x905ac2],
      }"
      @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="controls.setInput(PlayerSpecialInput.Confirm)"
    />
    <Text
      :configuration="{
        x: 15,
        y: 14,
        text: infoDialogMessage.text,
        style: MenuTextStyle,
      }"
    />
  </Container>
</template>
