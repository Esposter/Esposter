import type { Clause, CompositeKey } from "@esposter/azure";
import type {
  AdminActionType,
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  ReverseTickedTimestamp,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { getReverseTickedTimestamp } from "@esposter/db-schema";

// The moderation actions one person took in one room, each with its action type, its time and the id of the person it
// was taken against. The row holds no content of the target's, so none is read. The row key is a reverse-ticked timestamp
// in nanoseconds, which the same function reads back
export const readRoomModerationActionsByUser = async (
  moderationLogClient: CustomTableClient<AzureTableEntityMap[AzureTable.ModerationLog]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
) => {
  const clauses: Clause<Record<string, unknown>>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
    { key: "actorUserId", operator: BinaryOperator.Eq, value: userId },
  ];
  const actions = [];
  for await (const page of moderationLogClient
    .listEntities<
      CompositeKey & {
        actorUserId: UserInAuth["id"];
        rowKey: ReverseTickedTimestamp;
        targetUserId: UserInAuth["id"];
        type: AdminActionType;
      }
    >({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { rowKey, targetUserId, type } of page)
      actions.push({
        roomId,
        targetUserId,
        time: new Date(Number(BigInt(getReverseTickedTimestamp(rowKey)) / 10n ** 6n)),
        type,
      });
  return actions;
};
