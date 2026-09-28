import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.js"))).toMatchInlineSnapshot(
      `"index.js: 10.77 KB (11030 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.js"))).toMatchInlineSnapshot(
      `"contracts.js: 5.83 KB (5971 bytes)"`,
    );
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.d.ts"))).toMatchInlineSnapshot(
      `"index.d.ts: 36.86 KB (37741 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.d.ts"))).toMatchInlineSnapshot(
      `"contracts.d.ts: 8.99 KB (9209 bytes)"`,
    );
  });
});
