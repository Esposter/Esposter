import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Character } from "@/models/dungeons/world/Character";
import { type Position } from "grid-engine";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const character = ref<Character>({
    asset: {
      key: SpritesheetKey.Character,
      frame: 7,
    },
  });
  const position = ref<Position>({ x: 6, y: 21 });
  const isMoving = ref(false);
  return {
    character,
    position,
    isMoving,
  };
});
