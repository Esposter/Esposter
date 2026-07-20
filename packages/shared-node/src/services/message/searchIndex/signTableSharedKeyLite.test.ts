import { signTableSharedKeyLite } from "@/services/message/searchIndex/signTableSharedKeyLite";
import { describe, expect, test } from "vitest";

describe(signTableSharedKeyLite, () => {
  const accountName = "devstoreaccount1";
  const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
  const xMsDate = "Thu, 01 Jan 1970 00:00:00 GMT";
  const canonicalizedResource = "Messages()";

  test("builds a deterministic SharedKeyLite authorization header", () => {
    expect.hasAssertions();

    expect(signTableSharedKeyLite(accountName, accountKey, xMsDate, canonicalizedResource)).toMatchInlineSnapshot(
      `"SharedKeyLite devstoreaccount1:DoY2bTXi+gh8Hfm/ke7i07V2rQXcqQsI2gnor9Enj+w="`,
    );
  });
});
