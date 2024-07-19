import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";

export type SelectedItemDataKey<TEntityTypeKey extends EntityTypeKey> =
  | `selected${TEntityTypeKey}Index`
  | `selected${TEntityTypeKey}`
  | `is${TEntityTypeKey}Selected`
  | `unselect${TEntityTypeKey}`;
