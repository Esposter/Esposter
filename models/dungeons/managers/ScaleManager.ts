import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { getGameHeight, getGameWidth } from "@/services/dungeons/gameDimensions";
import { Scale } from "phaser";

export class ScaleManager {
  instance: Scale.ScaleManager;

  constructor(instance: Scale.ScaleManager) {
    this.instance = instance;
    this.resize();
    window.addEventListener("resize", () => this.resize());
    window.screen.orientation.addEventListener("change", () => this.resize());
  }

  resize() {
    const gameWidth = getGameWidth();
    const gameHeight = getGameHeight();
    this.instance.setGameSize(gameWidth, gameHeight);
    phaserEventEmitter.emit("resize");
  }
}
