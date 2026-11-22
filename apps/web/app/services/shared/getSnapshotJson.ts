import type { ItemMetadata } from "#shared/models/shared/ItemMetadata";

import { ItemMetadataPropertyNames } from "#shared/models/shared/ItemMetadataPropertyNames";

// `updatedAt` is bumped by saving itself (`saveItemMetadata`) so it never participates in the dirty check
export const getSnapshotJson = (value: Pick<ItemMetadata, "updatedAt">) =>
  JSON.stringify(value, (key, propertyValue: unknown) =>
    key === ItemMetadataPropertyNames.updatedAt ? undefined : propertyValue,
  );
