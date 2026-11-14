import type { IdMap } from "#src/models/cutover/IdMap";
import type { AzureIdMapEntry, InviteCodeEntry, OldIdMapEntry } from "#src/models/cutover/IdMapEntry";
import type { IdMapScope } from "#src/models/cutover/IdMapScope";
import type { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import type { R2Client } from "#src/models/cutover/R2Client";

import {
  azureIdMapEntrySchema,
  inviteCodeEntrySchema,
  messageNumberEntrySchema,
  oldIdMapEntrySchema,
} from "#src/models/cutover/IdMapEntry";
import { INVITE_CODE_SCOPE, MESSAGE_NUMBER_SCOPE, POSTGRES_ID_MAP_SCOPE } from "#src/services/cutover/constants";
import { assignMessageNumbers } from "#src/services/cutover/ids/assignMessageNumbers";
import { getCreatedAtUuidV7 } from "#src/services/cutover/ids/getCreatedAtUuidV7";
import { issueTokenHash } from "#src/services/cutover/ids/issueTokenHash";
import { rewriteOldIds } from "#src/services/cutover/ids/rewriteOldIds";
import { getIdMapKey } from "#src/services/cutover/tables/getIdMapKey";
import { getIdMapSegmentKey } from "#src/services/cutover/tables/getIdMapSegmentKey";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { generateSecretToken, InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The two calls the id map makes against the archive bucket, so a test can keep the segments in memory
type ArchiveClient = Pick<R2Client, "getText" | "putText">;

interface SegmentStore<T> {
  add: (entry: T) => void;
  entries: T[];
  flush: () => Promise<void>;
}

// One scope's entries, loaded from its segments in order. The entries given since the last flush are written as the next segment
const loadSegmentStore = async <T>(
  client: ArchiveClient,
  archiveBucket: string,
  scope: IdMapScope,
  entrySchema: z.ZodType<T>,
): Promise<SegmentStore<T>> => {
  const entries: T[] = [];
  let segmentCount = 0;
  for (;;) {
    // oxlint-disable-next-line no-await-in-loop -- segments load in order, each named by the count of the ones before it
    const text = await client.getText(archiveBucket, getIdMapSegmentKey(scope, segmentCount));
    if (text === undefined) break;
    entries.push(...z.array(entrySchema).parse(parseMachineJson(text)));
    segmentCount += 1;
  }
  let flushedCount = entries.length;
  return {
    add: (entry) => {
      entries.push(entry);
    },
    entries,
    flush: async () => {
      if (entries.length === flushedCount) return;
      await client.putText(
        archiveBucket,
        getIdMapSegmentKey(scope, segmentCount),
        JSON.stringify(entries.slice(flushedCount)),
      );
      flushedCount = entries.length;
      segmentCount += 1;
    },
  };
};

// Loads every scope the archive holds into the map they make.
// A row given no id yet gets a UUIDv7 built from its own createdAt, a credential row gets the hash of a fresh token for its old one, and an invite a fresh code, so no id, token or code is ever derived from the row.
// Every new entry waits in memory until `flush`, which the copy does before it writes the rows that carry those ids
export const createIdMap = async (
  client: ArchiveClient,
  archiveBucket: string,
  azureTables: LegacyAzureTable[],
): Promise<IdMap> => {
  const oldIdStore = await loadSegmentStore(client, archiveBucket, POSTGRES_ID_MAP_SCOPE, oldIdMapEntrySchema);
  const inviteStore = await loadSegmentStore(client, archiveBucket, INVITE_CODE_SCOPE, inviteCodeEntrySchema);
  const numberStore = await loadSegmentStore(client, archiveBucket, MESSAGE_NUMBER_SCOPE, messageNumberEntrySchema);
  const azureStores = new Map<LegacyAzureTable, SegmentStore<AzureIdMapEntry>>(
    await Promise.all(
      azureTables.map(
        async (azureTable) =>
          [azureTable, await loadSegmentStore(client, archiveBucket, azureTable, azureIdMapEntrySchema)] as const,
      ),
    ),
  );

  const oldIdMapEntryMap = new Map<string, OldIdMapEntry>(oldIdStore.entries.map((entry) => [entry.oldId, entry]));
  const oldIdNewIdMap = new Map<string, string>(oldIdStore.entries.map((entry) => [entry.oldId, entry.id]));
  const inviteCodeEntryMap = new Map<string, InviteCodeEntry>(
    inviteStore.entries.map((entry) => [entry.oldCode, entry]),
  );
  const keyAzureEntryMap = new Map<string, AzureIdMapEntry>();
  const oldTokenTokenHashMap = new Map<string, string>();
  for (const { oldToken, tokenHash } of oldIdStore.entries)
    if (oldToken && tokenHash) oldTokenTokenHashMap.set(oldToken, tokenHash);
  for (const [azureTable, store] of azureStores)
    for (const entry of store.entries) {
      keyAzureEntryMap.set(getIdMapKey(azureTable, entry.partitionKey, entry.rowKey), entry);
      if (entry.oldToken && entry.tokenHash) oldTokenTokenHashMap.set(entry.oldToken, entry.tokenHash);
    }
  const roomNumbersMap = new Map<string, Map<string, number>>();
  const getRoomNumbers = (roomId: string): Map<string, number> => {
    const numbers = roomNumbersMap.get(roomId) ?? new Map<string, number>();
    roomNumbersMap.set(roomId, numbers);
    return numbers;
  };
  for (const { number, roomId, rowKey } of numberStore.entries) getRoomNumbers(roomId).set(rowKey, number);

  const getAzureStore = (azureTable: LegacyAzureTable): SegmentStore<AzureIdMapEntry> => {
    const store = azureStores.get(azureTable);
    if (!store) throw new InvalidOperationError(Operation.Read, azureTable, "has no id map loaded");
    return store;
  };
  // A row that holds a token is given the hash of a fresh one, kept for the old token so every reference to it is found again
  const getIssuedFields = (oldToken: string | undefined): { oldToken?: string; tokenHash?: string } => {
    if (oldToken === undefined) return {};
    const tokenHash = oldTokenTokenHashMap.get(oldToken) ?? issueTokenHash();
    oldTokenTokenHashMap.set(oldToken, tokenHash);
    return { oldToken, tokenHash };
  };

  return {
    assign: (azureTable, partitionKey, rowKey, createdAt, oldToken) => {
      const store = getAzureStore(azureTable);
      const key = getIdMapKey(azureTable, partitionKey, rowKey);
      const existingEntry = keyAzureEntryMap.get(key);
      if (existingEntry) return existingEntry;

      const entry: AzureIdMapEntry = {
        id: getCreatedAtUuidV7(createdAt),
        partitionKey,
        rowKey,
        ...getIssuedFields(oldToken),
      };
      keyAzureEntryMap.set(key, entry);
      store.add(entry);
      return entry;
    },
    assignInviteCode: (oldCode) => {
      const existingInvite = inviteCodeEntryMap.get(oldCode);
      if (existingInvite) return existingInvite;

      const entry: InviteCodeEntry = { code: generateSecretToken(), oldCode };
      inviteCodeEntryMap.set(oldCode, entry);
      inviteStore.add(entry);
      return entry;
    },
    assignOldId: (oldId, createdAt, oldToken) => {
      const existingOldEntry = oldIdMapEntryMap.get(oldId);
      if (existingOldEntry) return existingOldEntry;

      const entry: OldIdMapEntry = { id: getCreatedAtUuidV7(createdAt), oldId, ...getIssuedFields(oldToken) };
      oldIdMapEntryMap.set(oldId, entry);
      oldIdNewIdMap.set(oldId, entry.id);
      oldIdStore.add(entry);
      return entry;
    },
    flush: async (scope) => {
      if (scope === POSTGRES_ID_MAP_SCOPE) return oldIdStore.flush();
      if (scope === INVITE_CODE_SCOPE) return inviteStore.flush();
      if (scope === MESSAGE_NUMBER_SCOPE) return numberStore.flush();
      return getAzureStore(scope).flush();
    },
    getMessageNumber: (roomId, rowKey) => roomNumbersMap.get(roomId)?.get(rowKey),
    inviteCodeOf: (oldCode) => inviteCodeEntryMap.get(oldCode)?.code,
    newIdOf: (oldId) => oldIdMapEntryMap.get(oldId)?.id,
    numberMessages: (roomId, messages) => {
      const numbers = getRoomNumbers(roomId);
      for (const { number, rowKey } of assignMessageNumbers(messages, numbers)) {
        numbers.set(rowKey, number);
        numberStore.add({ number, roomId, rowKey });
      }
    },
    oldIds: () => [...oldIdMapEntryMap.keys()],
    reissuedTokenHashOf: (oldToken) => oldTokenTokenHashMap.get(oldToken),
    rewrite: (text) => rewriteOldIds(text, oldIdNewIdMap),
  };
};
