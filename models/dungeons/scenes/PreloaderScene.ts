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
import { SceneWithPlugins } from "@/models/dungeons/SceneWithPlugins";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { type Loader } from "phaser";

export class PreloaderScene extends SceneWithPlugins {
  constructor() {
    super(SceneKey.Preloader);
  }

  preload() {
    const { width, height } = this.cameras.main;
    const progressBar = this.add.graphics({
      x: width / 2,
      y: height / 2,
      fillStyle: {
        color: 0xffffff,
        alpha: 1,
      },
    });
    const progressBox = this.add.graphics({
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

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: "0%",
      style: { font: "1.5rem Frijole" },
      origin: 0.5,
    });

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: "",
      style: { font: "1.5rem Frijole" },
      origin: 0.5,
    });

    this.load.on("progress", (value: number) => {
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

    this.load.on("fileprogress", (file: Loader.File) => {
      assetText.setText(`Loading asset: ${file.key}`);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      assetText.destroy();
      this.ready();
    });

    this.load.image(TextureManagerKey.ForestBackground, forestBackground);
    this.load.image(TextureManagerKey.HealthBarBackground, customUI);
    this.load.image(TextureManagerKey.HealthBarLeftCap, barHorizontalGreenLeft);
    this.load.image(TextureManagerKey.HealthBarMiddle, barHorizontalGreenMid);
    this.load.image(TextureManagerKey.HealthBarRightCap, barHorizontalGreenRight);
    this.load.image(TextureManagerKey.HealthBarLeftCapShadow, barHorizontalShadowLeft);
    this.load.image(TextureManagerKey.HealthBarMiddleShadow, barHorizontalShadowMid);
    this.load.image(TextureManagerKey.HealthBarRightCapShadow, barHorizontalShadowRight);
    this.load.image(TextureManagerKey.Carnodusk, carnodusk);
    this.load.image(TextureManagerKey.Iguanignite, iguanignite);
    this.load.image(TextureManagerKey.Cursor, cursor);
    this.load.image(TilesetKey.CloudCity, cloudCityTileset);
    this.load.tilemapTiledJSON(TilemapKey.CloudCity, cloudCityTilemap);
    this.load.spritesheet(SpritesheetKey.Characters, characters, { frameWidth: 52, frameHeight: 72 });
  }

  ready() {
    this.scene.start(SceneKey.Battle);
  }
}
