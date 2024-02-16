import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Character } from "@/models/dungeons/world/Character";
import { Direction, type Position } from "grid-engine";
import { type GameObjects } from "phaser";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const character = ref<Character>({
    asset: {
      key: SpritesheetKey.Character,
      frame: 7,
    },
  });
  const sprite = ref<GameObjects.Sprite>();
  const position = ref<Position>({ x: 6, y: 21 });
  const direction = ref(Direction.DOWN);
  const isMoving = ref(false);
  return {
    character,
    sprite,
    position,
    direction,
    isMoving,
  };
});
