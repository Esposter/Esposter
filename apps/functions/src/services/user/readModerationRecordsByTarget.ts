import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient, UserInAuth } from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, BinaryOperator, serializeClauses } from "@esposter/azure";

// The records in one moderation table that name the person as their target, across every room. The table is partitioned
// by room, so this reads each partition: a record in a room the person has left is one the archive keeps
export const readModerationRecordsByTarget = async <TEntity extends CompositeKey & { targetUserId: UserInAuth["id"] }>(
  tableClient: CustomTableClient<TEntity>,
  targetUserId: UserInAuth["id"],
): Promise<TEntity[]> => {
  const filter = serializeClauses([{ key: "targetUserId", operator: BinaryOperator.Eq, value: targetUserId }]);
  const records: TEntity[] = [];
  for await (const page of tableClient
    .listEntities<TEntity>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    records.push(...page);
  return records;
};
