import type { Context } from "#server/trpc/context";
import type { Entry } from "#src/models/shared/overlay/Entry";
import type { HeldTables } from "#src/models/shared/overlay/HeldTables";
import type { TouchedKey } from "#src/models/shared/overlay/TouchedKey";
import type { RowVersion } from "@esposter/db-schema";

import { readRowVersionsHeader } from "#shared/services/realtime/readRowVersionsHeader";
import { blockTable, friendRequestTable, friendTable } from "#src/services/message/user/pair/constants";
import { getBlockRowKey } from "#src/services/message/user/pair/getBlockRowKey";
import { getFriendRowKey } from "#src/services/message/user/pair/getFriendRowKey";
import { createSlotFor } from "#src/services/shared/overlay/createSlotFor";
import { recordTouches } from "#src/services/shared/overlay/recordTouches";
import { describe } from "vitest";
import { shallowRef } from "vue";

interface UncoveredWritesInput {
  // Makes the write through a caller built on the context it is handed, so the response headers it names come back
  call: (context: Context) => Promise<unknown>;
  // The seeded state: the held rows are the pair rows this database holds before the write
  context: Context;
  // The optimistic entry the write is issued with, built from the state before the call
  entry: Entry;
  // The procedure's name in its router, which is the path its row versions are read under
  path: string;
}

// The overlay key a row version names, read by the pair folder's key helpers: a friendship and a request by the pair's
// Natural id, and a block by its key columns. A row of another table names no key the pair entries touch
const getWriteKey = ({ key, table }: RowVersion): TouchedKey | undefined => {
  const { blockedId, blockerId, receiverId, senderId } = key;
  if (table === friendTable.name || table === friendRequestTable.name)
    return senderId === undefined || receiverId === undefined
      ? undefined
      : { key: getFriendRowKey(senderId, receiverId), table };
  if (table === blockTable.name && blockerId !== undefined && blockedId !== undefined)
    return { key: getBlockRowKey(blockerId, blockedId), table };
  return undefined;
};

// The rows a write named in its response, and those of them its entry does not touch, at the state the seeded database
// Holds. A row the entry shows nothing of is a gap: the write changed a row no optimistic change of it is shown on
export const getUncoveredWrites = async ({
  call,
  context,
  entry,
  path,
}: UncoveredWritesInput): Promise<{ named: RowVersion[]; uncovered: RowVersion[] }> => {
  const heldTables = shallowRef<HeldTables>({});
  const slotFor = createSlotFor(heldTables);
  const [friendships, friendRequests, blocks] = await Promise.all([
    context.db.query.friendsInSocial.findMany(),
    context.db.query.friendRequestsInSocial.findMany(),
    context.db.query.blocksInSocial.findMany(),
  ]);
  for (const friendship of friendships) slotFor(friendTable).arrive(friendship);
  for (const friendRequest of friendRequests) slotFor(friendRequestTable).arrive(friendRequest);
  for (const block of blocks) slotFor(blockTable).arrive(block);
  const touchedKeys = new Set(recordTouches(slotFor, entry).map(({ key, table }) => JSON.stringify([table, key])));

  const responseContext = { ...context, responseHeaders: new Headers() };
  await call(responseContext);
  const named = readRowVersionsHeader(responseContext.responseHeaders, path);
  const uncovered = named.filter((rowVersion) => {
    const writeKey = getWriteKey(rowVersion);
    return writeKey === undefined || !touchedKeys.has(JSON.stringify([writeKey.table, writeKey.key]));
  });
  return { named, uncovered };
};

describe.todo(getUncoveredWrites);
