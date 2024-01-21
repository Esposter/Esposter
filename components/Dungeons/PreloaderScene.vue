<script setup lang="ts">
import cursor from "@/assets/dungeons/UI/cursor.png";
import forestBackground from "@/assets/dungeons/battleBackgrounds/forestBackground.png";
import barHorizontalGreenLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenLeft.png";
import barHorizontalGreenMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenMid.png";
import barHorizontalGreenRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalGreenRight.png";
import barHorizontalShadowLeft from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowLeft.png";
import barHorizontalShadowMid from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowMid.png";
import barHorizontalShadowRight from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/barHorizontalShadowRight.png";
import customUI from "@/assets/dungeons/kenneysAssets/UISpaceExpansion/customUI.png";
import carnodusk from "@/assets/dungeons/monsters/carnodusk.png";
import iguanignite from "@/assets/dungeons/monsters/iguanignite.png";
import characters from "@/assets/dungeons/spritesheets/characters.png";
import cloudCityTilemap from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudCityTileset from "@/assets/dungeons/tilesets/cloud_city.png";
import Rectangle from "@/lib/phaser/components/Rectangle.vue";
import Scene from "@/lib/phaser/components/Scene.vue";
import Text from "@/lib/phaser/components/Text.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { type Loader } from "phaser";

const phaserStore = usePhaserStore();
const { sceneKey } = storeToRefs(phaserStore);
const x = ref<number>();
const y = ref<number>();
const percentageText = ref("0%");
const assetText = ref("");
const progressBoxWidth = ref(320);
const progressBoxHeight = ref(50);
const progressBarMaxWidth = ref(300);
const progressBarWidth = ref(0);
const progressBarHeight = ref(30);

const preload = (scene: SceneWithPlugins) => {
  const { width, height } = scene.cameras.main;
  x.value = width / 2;
  y.value = height / 2;

  scene.load.on("progress", async (value: number) => {
    progressBarWidth.value = progressBarMaxWidth.value * value;
    percentageText.value = `${parseInt((value * 100).toString())}%`;
  });

  scene.load.on("fileprogress", (file: Loader.File) => {
    assetText.value = `Loading asset: ${file.key}`;
  });

  scene.load.on("complete", () => {
    sceneKey.value = SceneKey.Battle;
  });

  scene.load.image(TextureManagerKey.ForestBackground, forestBackground);
  scene.load.image(TextureManagerKey.HealthBarBackground, customUI);
  scene.load.image(TextureManagerKey.HealthBarLeftCap, barHorizontalGreenLeft);
  scene.load.image(TextureManagerKey.HealthBarMiddle, barHorizontalGreenMid);
  scene.load.image(TextureManagerKey.HealthBarRightCap, barHorizontalGreenRight);
  scene.load.image(TextureManagerKey.HealthBarLeftCapShadow, barHorizontalShadowLeft);
  scene.load.image(TextureManagerKey.HealthBarMiddleShadow, barHorizontalShadowMid);
  scene.load.image(TextureManagerKey.HealthBarRightCapShadow, barHorizontalShadowRight);
  scene.load.image(TextureManagerKey.Carnodusk, carnodusk);
  scene.load.image(TextureManagerKey.Iguanignite, iguanignite);
  scene.load.image(TextureManagerKey.Cursor, cursor);
  scene.load.image(TilesetKey.CloudCity, cloudCityTileset);
  scene.load.tilemapTiledJSON(TilemapKey.CloudCity, cloudCityTilemap);
  scene.load.spritesheet(SpritesheetKey.Characters, characters, { frameWidth: 52, frameHeight: 72 });
};
</script>

<template>
  <Scene :scene-key="SceneKey.Preloader" auto-start :cls="SceneWithPlugins" @preload="preload">
    <Rectangle
      :configuration="{
        x,
        y,
        width: progressBarWidth,
        height: progressBarHeight,
        fillColor: 0xffffff,
      }"
    />
    <Rectangle
      :configuration="{
        x,
        y,
        width: progressBoxWidth,
        height: progressBoxHeight,
        fillColor: 0x222222,
        alpha: 0.8,
      }"
    />
    <Text
      :configuration="{
        x,
        y,
        text: percentageText,
        style: { font: '1.5rem Frijole' },
        origin: 0.5,
      }"
    />
    <Text
      :configuration="{
        x,
        y: y ? y + 50 : undefined,
        text: assetText,
        style: { font: '1.5rem Frijole' },
        origin: 0.5,
      }"
    />
  </Scene>
</template>
