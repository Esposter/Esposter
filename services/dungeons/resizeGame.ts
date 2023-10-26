import { phaserEventEmitter } from "@/models/dungeons/events/phaser";
import { getGameHeight, getGameWidth } from "@/services/dungeons/gameDimensions";
import { Scale } from "phaser";

export const resizeGame = (scaleManager: { setGameSize: Scale.ScaleManager["setGameSize"] }) => {
  const gameWidth = getGameWidth();
  const gameHeight = getGameHeight();
  scaleManager.setGameSize(gameWidth, gameHeight);
  phaserEventEmitter.emit("resize");
};
