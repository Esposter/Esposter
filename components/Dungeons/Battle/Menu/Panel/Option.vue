<script setup lang="ts">
import { battleUITextStyle } from "@/assets/dungeons/styles/battleUITextStyle";
import Container from "@/lib/phaser/components/Container.vue";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { ActivePanel } from "@/models/dungeons/battle/UI/menu/ActivePanel";
import { PlayerOption } from "@/models/dungeons/battle/UI/menu/PlayerOption";
import { CursorPositionMap } from "@/services/dungeons/battle/UI/menu/CursorPositionMap";
import { PlayerOptionGrid } from "@/services/dungeons/battle/UI/menu/PlayerOptionGrid";
import { MENU_HEIGHT, MENU_PADDING } from "@/services/dungeons/battle/UI/menu/constants";
import { useBattleSceneStore } from "~/store/dungeons/scene/battle";

const battleSceneStore = useBattleSceneStore();
const { activePanel } = storeToRefs(battleSceneStore);
</script>

<template>
  <Container v-if="activePanel === ActivePanel.Option" :configuration="{ x: 520, y: 448 }">
    <Rectangle
      :configuration="{
        width: 500,
        height: MENU_HEIGHT,
        origin: 0,
        fillColor: 0xede4f3,
        strokeStyle: [MENU_PADDING * 2, 0x905ac2],
      }"
    />
    <Text
      :configuration="{
        x: 55,
        y: 22,
        text: PlayerOption.Fight,
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 240,
        y: 22,
        text: PlayerOption.Switch,
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 55,
        y: 70,
        text: PlayerOption.Item,
        style: battleUITextStyle,
      }"
    />
    <Text
      :configuration="{
        x: 240,
        y: 70,
        text: PlayerOption.Flee,
        style: battleUITextStyle,
      }"
    />
    <DungeonsBattleMenuCursor :grid="PlayerOptionGrid" :position-map="CursorPositionMap" />
  </Container>
</template>
