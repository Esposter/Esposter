import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { AInputResolver } from "@/models/resolvers/dungeons/AInputResolver";
import { useMenuStore } from "@/store/dungeons/monsterParty/menu";

export class MenuInputResolver extends AInputResolver {
  handleInput(scene: SceneWithPlugins, justDownInput: PlayerInput) {
    const menuStore = useMenuStore();
    const { onPlayerInput } = menuStore;
    return onPlayerInput(scene, justDownInput);
  }
}