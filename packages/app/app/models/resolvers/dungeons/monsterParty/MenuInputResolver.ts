import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "vue-phaserjs";

import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useMonsterPartyMenuStore } from "@/store/dungeons/monsterParty/menu";

export class MenuInputResolver extends AInputResolver {
  override handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const monsterPartyMenuStore = useMonsterPartyMenuStore();
    const { onPlayerInput } = monsterPartyMenuStore;
    return onPlayerInput(scene, justDownInput);
  }
}
