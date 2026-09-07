import type { AzureEntity, AzureEntityType, AzureUpdateEntity, CustomTableClient } from "@esposter/db-schema";
import type { Class } from "type-fest";

import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { getEntityWithEtag } from "@esposter/db";
import { getResultAsync } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

interface ConditionalEntityUpdateOptions<TTableEntity extends AzureEntity, TEntity extends TTableEntity> {
  entityType: AzureEntityType;
  // The version the caller's guards already read, so the first attempt costs no extra round trip
  entityWithEtag: { entity: TEntity; etag: string };
  // Derives the write from the version it is about to be conditioned on. This is the whole point of the retry:
  // A caller's intent ("clear this field", "drop this file", "record this vote") is still valid after losing a
  // Race, while the body it first computed is not — replaying that body is what reverts a concurrent change
  getUpdateEntity: (entity: TEntity) => AzureUpdateEntity<TTableEntity>;
  writeEntity: (entity: AzureUpdateEntity<TTableEntity>, etag: string) => Promise<unknown>;
}
// Bounded so a hot entity's concurrent writes cannot spin the mutation; on exhaustion the write is refused rather
// Than dropped, so the caller is told to try again instead of believing a lost change landed
const MAX_ENTITY_ETAG_RETRIES = 3;
// A read-modify-write of an entity body, made conditional on the version it was computed against. Two callers
// Otherwise both derive their write from the same version and the later one echoes back a body that never saw the
// Earlier change, erasing it with nothing surfaced to either caller
export const updateEntityConditionally = async <TTableEntity extends AzureEntity, TEntity extends TTableEntity>(
  tableClient: CustomTableClient<TTableEntity>,
  entityClass: Class<TEntity>,
  { entityType, entityWithEtag, getUpdateEntity, writeEntity }: ConditionalEntityUpdateOptions<TTableEntity, TEntity>,
): Promise<AzureUpdateEntity<TTableEntity>> => {
  // The version under write travels as one value so each attempt destructures it into its own consts — the
  // Conditional write closes over them, and a closure over a variable the loop reassigns is exactly the bug
  // Optimistic concurrency exists to avoid
  let entityVersion = entityWithEtag;

  for (let attempt = 0; attempt < MAX_ENTITY_ETAG_RETRIES; attempt++) {
    const { entity, etag } = entityVersion;
    const { partitionKey, rowKey } = entity;
    const updatedEntity = getUpdateEntity(entity);
    const updateError = await getResultAsync(() => writeEntity(updatedEntity, etag)).match(
      () => undefined,
      (error) => error,
    );
    if (!updateError) return updatedEntity;
    // The re-read is the only thing that classifies the failed write, and whatever rejected the write routinely
    // Rejects the read behind it — so a read that FAILED must not arrive here as the entity being gone. It
    // Leaves the attempt unclassified, which is what CONFLICT already means: the write did not land, the caller
    // Sends it again, and the fault itself is logged rather than renamed into a deletion for the user
    const rereadEntityVersion = await getResultAsync(() =>
      getEntityWithEtag(tableClient, entityClass, partitionKey, rowKey),
    ).match(
      (readEntityVersion) => readEntityVersion,
      (error) => {
        console.error(error);
        throw new TRPCError({ code: "CONFLICT" });
      },
    );
    if (!rereadEntityVersion) throw getNotFoundError(entityType, JSON.stringify({ partitionKey, rowKey }));
    // Only a lost race is retried, and the re-read is what tells the two apart without a status code: a version
    // That moved is the concurrent write this one was rejected for, while an unchanged version means the write
    // Failed for a reason retrying cannot fix, so that error propagates as itself
    else if (rereadEntityVersion.etag === etag) throw updateError;

    entityVersion = rereadEntityVersion;
  }

  throw new TRPCError({ code: "CONFLICT" });
};
