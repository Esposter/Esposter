import type { Game } from "phaser";

import { Scenes } from "phaser";

// Phaser's `isActive` is RUNNING alone, so a paused, sleeping or still-loading scene was skipped, and a scene removed
// Without a stop never ran its shutdown hooks or cleared its ready flag. A started scene owes that shutdown, from its
// READY until its SHUTDOWN; a scene that never started has nothing to shut down
export const stopStartedScene = (game: Game, sceneKey: string) => {
  const scene = game.scene.getScene(sceneKey);
  if (!scene) return;

  const { status } = scene.sys.settings;
  if (status >= Scenes.START && status < Scenes.SHUTDOWN) game.scene.stop(sceneKey);
};
