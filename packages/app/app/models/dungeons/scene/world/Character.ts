import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Asset } from "#shared/models/dungeons/Asset";
import type { CharacterId } from "@/models/dungeons/scene/world/CharacterId";
import type { Direction, WalkingAnimationMapping } from "grid-engine";

import { ItemMetadata } from "#shared/models/entity/ItemMetadata";

export class Character<TName extends string = string> extends ItemMetadata {
  asset!: Asset;
  direction?: Direction;
  id!: `${CharacterId.Npc}${NpcId}` | CharacterId.Player;
  name!: TName;
  // Some spritesheets may only animate one side and rely on us to flipX
  singleSidedSpritesheetDirection?: Direction.LEFT | Direction.RIGHT;
  walkingAnimationMapping!: WalkingAnimationMapping;

  constructor(init: Partial<Character<TName>>) {
    super();
    Object.assign(this, init);
  }
}
