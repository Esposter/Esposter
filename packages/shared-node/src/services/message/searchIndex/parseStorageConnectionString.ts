import type { StorageAccountCredential } from "@/services/message/searchIndex/models/StorageAccountCredential";

import { InvalidOperationError, Operation } from "@esposter/shared";

export const parseStorageConnectionString = (connectionString: string): StorageAccountCredential => {
  const entries = new Map(
    connectionString
      .split(";")
      .filter(Boolean)
      .map((segment) => {
        const separatorIndex = segment.indexOf("=");
        // AccountKey is base64 and carries its own `=` padding, so split on the first `=` only.
        return [segment.slice(0, separatorIndex), segment.slice(separatorIndex + 1)] as const;
      }),
  );
  const accountName = entries.get("AccountName") ?? "";
  const accountKey = entries.get("AccountKey") ?? "";
  const endpointSuffix = entries.get("EndpointSuffix") || "core.windows.net";
  if (!accountName || !accountKey)
    throw new InvalidOperationError(
      Operation.Read,
      parseStorageConnectionString.name,
      "connection string is missing AccountName or AccountKey",
    );
  return { accountKey, accountName, tableEndpoint: `https://${accountName}.table.${endpointSuffix}` };
};
