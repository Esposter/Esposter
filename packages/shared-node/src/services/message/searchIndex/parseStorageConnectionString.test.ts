import { parseStorageConnectionString } from "@/services/message/searchIndex/parseStorageConnectionString";
import { describe, expect, test } from "vitest";

describe(parseStorageConnectionString, () => {
  const accountName = "devstoreaccount1";
  const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";

  test("parses a valid connection string", () => {
    expect.hasAssertions();

    const credential = parseStorageConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`,
    );

    expect(credential).toStrictEqual({
      accountKey,
      accountName,
      tableEndpoint: `https://${accountName}.table.core.windows.net`,
    });
  });

  test("throws when AccountKey is missing", () => {
    expect.hasAssertions();

    expect(() =>
      parseStorageConnectionString(`AccountName=${accountName};EndpointSuffix=core.windows.net`),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseStorageConnectionString, connection string is missing AccountName or AccountKey]`,
    );
  });
});
