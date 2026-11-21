import type { Character } from "#src/models/dungeons/scene/world/Character";
import type { GridEngineEvents } from "grid-engine-headless";
import type { SceneWithPlugins, Sprite } from "vue-phaserjs";

export interface CharacterProps {
  id: Character["id"];
  onComplete?: InstanceType<typeof Sprite>["$props"]["onComplete"];
  onPositionChangeFinished?: (
    scene: SceneWithPlugins,
    positionChange: GridEngineEvents["positionChangeFinished"],
  ) => void;
  onPositionChangeStarted?: (
    scene: SceneWithPlugins,
    positionChange: GridEngineEvents["positionChangeStarted"],
  ) => void;
  singleSidedSpritesheetDirection?: Character["singleSidedSpritesheetDirection"];
  speed?: number;
  spriteConfiguration: InstanceType<typeof Sprite>["$props"]["configuration"];
  walkingAnimationMapping: Character["walkingAnimationMapping"];
}
