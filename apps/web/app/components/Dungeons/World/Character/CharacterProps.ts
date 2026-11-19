import type { PositionChangeFinished } from "#src/models/dungeons/gridEngine/PositionChangeFinished";
import type { PositionChangeStarted } from "#src/models/dungeons/gridEngine/PositionChangeStarted";
import type { Character } from "#src/models/dungeons/scene/world/Character";
import type { SceneWithPlugins, Sprite } from "vue-phaserjs";

export interface CharacterProps {
  id: Character["id"];
  onComplete?: InstanceType<typeof Sprite>["$props"]["onComplete"];
  onPositionChangeFinished?: (
    scene: SceneWithPlugins,
    ...args: Parameters<PositionChangeFinished>
  ) => ReturnType<PositionChangeFinished>;
  onPositionChangeStarted?: (
    scene: SceneWithPlugins,
    ...args: Parameters<PositionChangeStarted>
  ) => ReturnType<PositionChangeStarted>;
  singleSidedSpritesheetDirection?: Character["singleSidedSpritesheetDirection"];
  speed?: number;
  spriteConfiguration: InstanceType<typeof Sprite>["$props"]["configuration"];
  walkingAnimationMapping: Character["walkingAnimationMapping"];
}
