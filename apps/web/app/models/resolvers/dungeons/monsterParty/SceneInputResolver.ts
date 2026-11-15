import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "#src/models/resolvers/dungeons/AInputResolver";
import { useMonsterPartyInputStore } from "#src/store/dungeons/monsterParty/input";

export class SceneInputResolver extends AInputResolver {
  override async handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const monsterPartyInputStore = useMonsterPartyInputStore();
    const { onPlayerInput } = monsterPartyInputStore;
    await onPlayerInput(scene, justDownInput);
    return true;
  }
}
