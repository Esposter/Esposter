import type { AzureMetadataOperation } from "@/models/shared/metadata/AzureMetadataOperation";
import type { EntityTypeKey } from "@esposter/db-schema";

export type AzureMetadataOperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  `${Uncapitalize<AzureMetadataOperation>}${TEntityTypeKey}s`;
