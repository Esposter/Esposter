import type { AItemEntity, AItemEntityPropertyNames } from "#shared/models/entity/AItemEntity";

import type { ToData } from "@esposter/shared";

export type EntityIdKeys<TEntity extends object> =
  TEntity extends ToData<AItemEntity> ? [typeof AItemEntityPropertyNames.id] : (keyof TEntity & string)[];
