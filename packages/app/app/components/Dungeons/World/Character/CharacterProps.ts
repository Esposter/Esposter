import type { MovementStarted } from "@/models/dungeons/gridEngine/MovementStarted";
import type { MovementStopped } from "@/models/dungeons/gridEngine/MovementStopped";
import type { PositionChangeFinished } from "@/models/dungeons/gridEngine/PositionChangeFinished";
import type { PositionChangeStarted } from "@/models/dungeons/gridEngine/PositionChangeStarted";
import type { Character } from "@/models/dungeons/scene/world/Character";
import type { SceneWithPlugins } from "vue-phaserjs";

import { Sprite } from "vue-phaserjs";

export interface CharacterProps {
  id: Character["id"];
  onComplete?: InstanceType<typeof Sprite>["$props"]["onComplete"];
  onMovementStarted?: (scene: SceneWithPlugins, ...args: Parameters<MovementStarted>) => ReturnType<MovementStarted>;
  onMovementStopped?: (scene: SceneWithPlugins, ...args: Parameters<MovementStopped>) => ReturnType<MovementStopped>;
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
