import type { TableClient } from "@azure/data-tables";

import { getTableClient } from "#src/services/azure/table/getTableClient";
import { TableClient as AzureTableClient } from "@azure/data-tables";
import { AzureTable } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@azure/data-tables"), () => ({
  TableClient: {
    fromConnectionString: vi.fn<typeof TableClient.fromConnectionString>(
      () => ({ createTable: () => Promise.resolve() }) as unknown as TableClient,
    ),
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

  // A plaintext endpoint on any other host is a production Functions table, which the client must keep refusing
  test("a table endpoint on another host is not allowed an insecure connection", async () => {
    expect.hasAssertions();

    const connectionString = "TableEndpoint=http://example.table.core.windows.net/a;";
    await getTableClient(connectionString, AzureTable.Messages);

    expect(AzureTableClient.fromConnectionString).toHaveBeenCalledExactlyOnceWith(
      connectionString,
      AzureTable.Messages,
      { allowInsecureConnection: false },
    );
  });

  test("a table endpoint whose userinfo is a loopback name but whose host is elsewhere is not allowed an insecure connection", async () => {
    expect.hasAssertions();

    const connectionString = "TableEndpoint=http://localhost:80@example.table.core.windows.net/a;";
    await getTableClient(connectionString, AzureTable.Messages);

    expect(AzureTableClient.fromConnectionString).toHaveBeenCalledExactlyOnceWith(
      connectionString,
      AzureTable.Messages,
      { allowInsecureConnection: false },
    );
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
