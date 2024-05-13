import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Asset } from "@/models/dungeons/Asset";
import type { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { Direction, Position, WalkingAnimationMapping } from "grid-engine";

export interface Character<TName extends string = string> extends ItemMetadata {
  id: CharacterId.Player | `${CharacterId.Npc}${NpcId}`;
  name: TName;
  position: Position;
  direction?: Direction;
  asset: Asset;
  walkingAnimationMapping: WalkingAnimationMapping;
  // Some spritesheets may only animate one side and rely on us to flipX
  singleSidedSpritesheetDirection?: Direction.LEFT | Direction.RIGHT;
}
