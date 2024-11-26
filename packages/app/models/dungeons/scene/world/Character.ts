import type { NpcId } from "@/generated/tiled/propertyTypes/enum/NpcId";
import type { Asset } from "@/models/dungeons/Asset";
import type { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";
import type { Direction, Position, WalkingAnimationMapping } from "grid-engine";

export interface Character<TName extends string = string> extends ItemMetadata {
  asset: Asset;
  direction?: Direction;
  id: `${CharacterId.Npc}${NpcId}` | CharacterId.Player;
  name: TName;
  position: Position;
  // Some spritesheets may only animate one side and rely on us to flipX
  singleSidedSpritesheetDirection?: Direction.LEFT | Direction.RIGHT;
  walkingAnimationMapping: WalkingAnimationMapping;
}
