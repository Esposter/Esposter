import type { ItemEntityType } from "@esposter/shared";

import { ItemCompositeKeyEntity } from "#src/models/shared/ItemCompositeKeyEntity";

export abstract class CompositeKeyMetadataEntity<T extends string>
  extends ItemCompositeKeyEntity
  implements ItemEntityType<T>
{
  declare type: T;
}
