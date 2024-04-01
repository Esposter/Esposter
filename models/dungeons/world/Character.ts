import type { Asset } from "@/models/dungeons/Asset";
import type { CharacterId } from "@/models/dungeons/world/CharacterId";
import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { Direction, Position, WalkingAnimationMapping } from "grid-engine";

export interface Character extends ItemMetadata {
  id: `${CharacterId}${string}`;
  name: string;
  position: Position;
  direction?: Direction;
  asset: Asset;
  walkingAnimationMapping: WalkingAnimationMapping;
  // Some spritesheets may only animate one side and rely on us to flipX
  singleSidedSpritesheetDirection?: Direction.LEFT | Direction.RIGHT;
}
