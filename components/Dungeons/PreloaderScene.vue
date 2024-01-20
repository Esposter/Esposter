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
import Scene from "@/lib/phaser/components/Scene.vue";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { SceneWithPlugins } from "@/models/dungeons/scenes/plugins/SceneWithPlugins";
import { type Loader } from "phaser";

const preload = (scene: SceneWithPlugins) => {
  const { width, height } = scene.cameras.main;
  const progressBar = scene.add.graphics({
    x: width / 2,
    y: height / 2,
    fillStyle: {
      color: 0xffffff,
      alpha: 1,
    },
  });
  const progressBox = scene.add.graphics({
    x: width / 2,
    y: height / 2,
    fillStyle: {
      color: 0x222222,
      alpha: 0.8,
    },
  });
  const progressBoxWidth = 320;
  const progressBoxHeight = 50;
  progressBox.fillRect(-progressBoxWidth / 2, -progressBoxHeight / 2, progressBoxWidth, progressBoxHeight);

  const percentText = scene.make.text({
    x: width / 2,
    y: height / 2,
    text: "0%",
    style: { font: "1.5rem Frijole" },
    origin: 0.5,
  });

  const assetText = scene.make.text({
    x: width / 2,
    y: height / 2 + 50,
    text: "",
    style: { font: "1.5rem Frijole" },
    origin: 0.5,
  });

  scene.load.on("progress", (value: number) => {
    const progressBarMaxWidth = 300;
    const progressBarWidth = progressBarMaxWidth * value;
    const progressBarHeight = 30;
    percentText.setText(`${parseInt((value * 100).toString())}%`);
    progressBar.fillRect(
      -progressBoxWidth / 2 + (progressBoxWidth - progressBarMaxWidth) / 2,
      -progressBarHeight / 2,
      progressBarWidth,
      progressBarHeight,
    );
  });

  scene.load.on("fileprogress", (file: Loader.File) => {
    assetText.setText(`Loading asset: ${file.key}`);
  });

  scene.load.on("complete", () => {
    progressBar.destroy();
    progressBox.destroy();
    percentText.destroy();
    assetText.destroy();
    scene.scene.start(SceneKey.Battle);
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
  <Scene :name="SceneKey.Preloader" auto-start :cls="SceneWithPlugins" @preload="preload" />
</template>
