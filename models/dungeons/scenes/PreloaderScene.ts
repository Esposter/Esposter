import characters from "@/assets/dungeons/spritesheets/characters.png";
import cloudCityTilemap from "@/assets/dungeons/tilemaps/cloud_city.json";
import cloudCityTileset from "@/assets/dungeons/tilesets/cloud_city.png";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { TilemapKey } from "@/models/dungeons/keys/TilemapKey";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { type Loader, Scene } from "phaser";

export class PreloaderScene extends Scene {
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

    this.load.image(TilesetKey.CloudCity, cloudCityTileset);
    this.load.tilemapTiledJSON(TilemapKey.CloudCity, cloudCityTilemap);
    this.load.spritesheet(SpritesheetKey.Characters, characters, { frameWidth: 52, frameHeight: 72 });
  }

  ready() {
    this.scene.start(SceneKey.Game);
  }
}
