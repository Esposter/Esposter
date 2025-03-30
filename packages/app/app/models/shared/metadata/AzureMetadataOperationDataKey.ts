import type { EntityTypeKey } from "@/models/shared/entity/EntityTypeKey";
import type { AzureMetadataOperation } from "@/models/shared/metadata/AzureMetadataOperation";

export type AzureMetadataOperationDataKey<TEntityTypeKey extends EntityTypeKey> =
  `${Uncapitalize<AzureMetadataOperation>}${TEntityTypeKey}List`;
