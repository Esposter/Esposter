import type { StorageAccountCredential } from "@/services/message/searchIndex/models/StorageAccountCredential";
import type { TableRestClient } from "@/services/message/searchIndex/models/TableRestClient";

import { MESSAGES_TABLE, TABLE_API_VERSION } from "@/services/message/searchIndex/constants";
import { messageSearchDocumentSchema } from "@/services/message/searchIndex/models/MessageSearchDocument";
import { signTableSharedKeyLite } from "@/services/message/searchIndex/signTableSharedKeyLite";
import { getResultAsync } from "@esposter/shared";
import { z } from "zod";

const roomIdRowSchema = z.object({ PartitionKey: z.string() });

// SharedKeyLite is hand-signed here because shared-node deliberately has no `@azure/data-tables` dependency,
// So the REST call is issued directly via fetch + node:crypto instead of the SDK's TableClient.
const queryTable = <TRow>(
  credential: StorageAccountCredential,
  rowSchema: z.ZodType<TRow>,
  select: string,
  filter?: string,
): Promise<TRow[]> =>
  getResultAsync(async () => {
    const responseSchema = z.object({ value: z.array(rowSchema) });
    const rows: TRow[] = [];
    let nextPartitionKey = "";
    let nextRowKey = "";
    do {
      const url = new URL(`${credential.tableEndpoint}/${MESSAGES_TABLE}()`);
      if (filter) url.searchParams.set("$filter", filter);
      // An empty projection returns every column, needed to rebuild a full message document.
      if (select) url.searchParams.set("$select", select);
      if (nextPartitionKey) url.searchParams.set("NextPartitionKey", nextPartitionKey);
      if (nextRowKey) url.searchParams.set("NextRowKey", nextRowKey);
      const xMsDate = new Date().toUTCString();
      const response = await fetch(url, {
        headers: {
          Accept: "application/json;odata=nometadata",
          Authorization: signTableSharedKeyLite(
            credential.accountName,
            credential.accountKey,
            xMsDate,
            `${MESSAGES_TABLE}()`,
          ),
          "x-ms-date": xMsDate,
          "x-ms-version": TABLE_API_VERSION,
        },
      });
      if (!response.ok) throw new Error(`Azure Table request failed with ${response.status}: ${await response.text()}`);

      rows.push(...responseSchema.parse(await response.json()).value);
      nextPartitionKey = response.headers.get("x-ms-continuation-NextPartitionKey") ?? "";
      nextRowKey = response.headers.get("x-ms-continuation-NextRowKey") ?? "";
    } while (nextPartitionKey || nextRowKey);
    return rows;
  })
    .orTee(console.error)
    .unwrapOr([]);

export const createTableRestClient = (credential: StorageAccountCredential): TableRestClient => ({
  listMessageRowKeysByRoom: (roomId) =>
    queryTable(credential, messageSearchDocumentSchema, "RowKey,PartitionKey", `PartitionKey eq '${roomId}'`),
  listMessagesByRoom: (roomId) =>
    queryTable(credential, messageSearchDocumentSchema, "", `PartitionKey eq '${roomId}'`),
  listRoomIds: async () => {
    const rows = await queryTable(credential, roomIdRowSchema, "PartitionKey");
    return [...new Set(rows.map(({ PartitionKey }) => PartitionKey))];
  },
});
