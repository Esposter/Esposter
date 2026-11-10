import type { TableClient } from "@azure/data-tables";

import { getTableClient } from "#src/services/azure/table/getTableClient";
import { TableClient as AzureTableClient } from "@azure/data-tables";
import { AzureTable } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@azure/data-tables"), () => ({
  TableClient: {
    fromConnectionString: vi.fn<typeof TableClient.fromConnectionString>(() => ({
      createTable: () => Promise.resolve(),
    })),
  } as unknown as typeof TableClient,
}));

describe(getTableClient, () => {
  // The library allows an unencrypted connection only for the literal `UseDevelopmentStorage=true`, so an emulator named by
  // Its own endpoints on other ports has to be allowed explicitly or its first request throws
  test("an emulator named by an http table endpoint is allowed an insecure connection", async () => {
    expect.hasAssertions();

    const connectionString = "TableEndpoint=http://127.0.0.1:0/a;";
    await getTableClient(connectionString, AzureTable.Messages);

    expect(AzureTableClient.fromConnectionString).toHaveBeenCalledWith(connectionString, AzureTable.Messages, {
      allowInsecureConnection: true,
    });
  });

  test("a secure table endpoint is not allowed an insecure connection", async () => {
    expect.hasAssertions();

    const connectionString = "TableEndpoint=https://127.0.0.1:0/a;";
    await getTableClient(connectionString, AzureTable.Messages);

    expect(AzureTableClient.fromConnectionString).toHaveBeenCalledWith(connectionString, AzureTable.Messages, {
      allowInsecureConnection: false,
    });
  });
});
