import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useMonsterPartyInputStore } from "@/store/dungeons/monsterParty/input";

export class SceneInputResolver extends AInputResolver {
  async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, justDownInput);
    return true;
  }
}
