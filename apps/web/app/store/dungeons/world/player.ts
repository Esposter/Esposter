import type { GameObjects } from "phaser";

import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { usePlayerStore } from "#src/store/dungeons/player";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { toRawDeep } from "@esposter/shared";
import { Direction } from "grid-engine";
import { z } from "zod";

// The respawn's direction is the shared mirror of grid-engine's, so it is checked into the engine's own enum before the emit
const respawnDirectionSchema = z.enum(Direction) satisfies z.ZodType<Direction>;

export const useWorldPlayerStore = defineStore("dungeons/world/player", () => {
  const playerStore = usePlayerStore();
  const monsterPartySceneStore = useMonsterPartySceneStore();
  const worldSceneStore = useWorldSceneStore();
  const { switchToTilemap } = worldSceneStore;
  const respawn = async () => {
    const { direction, position, tilemapKey } = structuredClone(toRawDeep(playerStore.player.respawnLocation));
    await switchToTilemap(tilemapKey);
    phaserEventEmitter.emit("playerTeleport", position, respawnDirectionSchema.parse(direction));
  };
  const healParty = () => {
    for (const monster of monsterPartySceneStore.monsters) monster.status.health = monster.statistics.maxHealth;
  };

  const sprite = ref<GameObjects.Sprite>();
  const isMoving = ref(false);
  return { healParty, isMoving, respawn, sprite };
});
