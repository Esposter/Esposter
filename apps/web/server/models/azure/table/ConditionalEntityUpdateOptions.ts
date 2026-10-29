import type { AzureEntity, AzureEntityType, AzureUpdateEntity, MessageMetadataType } from "@esposter/db-schema";

export interface ConditionalEntityUpdateOptions<
  TTableEntity extends AzureEntity,
  TEntity extends TTableEntity,
  TUpdateEntity extends AzureUpdateEntity<TTableEntity>,
> {
  // The name a missing entity reports: a table's entity type, or a metadata row's type inside a shared table
  entityType: AzureEntityType | MessageMetadataType;
  // The version the caller's guards already read, so the first attempt costs no extra round trip
  entityWithEtag: { entity: TEntity; etag: string };
  // Derives the write from the version it is about to be conditioned on. This is the whole point of the retry:
  // A caller's intent ("clear this field", "drop this file", "record this vote") is still valid after losing a
  // Race, while the body it first computed is not — replaying that body is what reverts a concurrent change
  getUpdateEntity: (entity: TEntity) => TUpdateEntity;
  writeEntity: (entity: TUpdateEntity, etag: string) => Promise<unknown>;
}
