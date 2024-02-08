import { SpritesheetKey } from "@/models/dungeons/keys/SpritesheetKey";
import { type Character } from "@/models/dungeons/world/Character";

export const usePlayerStore = defineStore("dungeons/world/player", () => {
  const character = ref<Character>({
    asset: {
      key: SpritesheetKey.Character,
      frame: 7,
    },
  });

  return {
    character,
  };
});
