import type { NpcId } from "#shared/generated/tiled/propertyTypes/enum/NpcId";
import type { Asset } from "#src/models/dungeons/Asset";
import type { CharacterId } from "#src/models/dungeons/scene/world/CharacterId";
import type { WalkingAnimationMapping } from "#src/models/dungeons/scene/world/WalkingAnimationMapping";
import type { ID_SEPARATOR } from "@esposter/shared";
import type { Direction } from "grid-engine-headless";

import { ItemMetadata } from "#shared/models/shared/ItemMetadata";

export class Character<TName extends string = string> extends ItemMetadata {
  declare asset: Asset;
  direction?: Direction;
  declare id: `${typeof CharacterId.Npc}${typeof ID_SEPARATOR}${NpcId}` | typeof CharacterId.Player;
  declare name: TName;
  // Some spritesheets may only animate one side and rely on us to flipX
  singleSidedSpritesheetDirection?: typeof Direction.Left | typeof Direction.Right;
  declare walkingAnimationMapping: WalkingAnimationMapping;

  constructor(init: Partial<Character<TName>>) {
    super();
    Object.assign(this, init);
  }
}
