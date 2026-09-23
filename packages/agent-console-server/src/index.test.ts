import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.js"))).toMatchInlineSnapshot(
      `"index.js: 5.82 KB (5956 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.js"))).toMatchInlineSnapshot(
      `"contracts.js: 4.04 KB (4136 bytes)"`,
    );
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.d.ts"))).toMatchInlineSnapshot(
      `"index.d.ts: 19.41 KB (19875 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.d.ts"))).toMatchInlineSnapshot(
      `"contracts.d.ts: 6.16 KB (6307 bytes)"`,
    );
  });
});
