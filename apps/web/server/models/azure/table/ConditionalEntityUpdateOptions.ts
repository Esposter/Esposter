import type { AzureEntity, AzureEntityType, AzureUpdateEntity } from "@esposter/db-schema";

export interface ConditionalEntityUpdateOptions<TTableEntity extends AzureEntity, TEntity extends TTableEntity> {
  entityType: AzureEntityType;
  // The version the caller's guards already read, so the first attempt costs no extra round trip
  entityWithEtag: { entity: TEntity; etag: string };
  // Derives the write from the version it is about to be conditioned on. This is the whole point of the retry:
  // A caller's intent ("clear this field", "drop this file", "record this vote") is still valid after losing a
  // Race, while the body it first computed is not — replaying that body is what reverts a concurrent change
  getUpdateEntity: (entity: TEntity) => AzureUpdateEntity<TTableEntity>;
  writeEntity: (entity: AzureUpdateEntity<TTableEntity>, etag: string) => Promise<unknown>;
}
