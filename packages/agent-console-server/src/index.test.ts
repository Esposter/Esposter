import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.js"))).toMatchInlineSnapshot(
      `"index.js: 9.83 KB (10063 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.js"))).toMatchInlineSnapshot(
      `"contracts.js: 5.22 KB (5349 bytes)"`,
    );
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.d.ts"))).toMatchInlineSnapshot(
      `"index.d.ts: 33.33 KB (34135 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.d.ts"))).toMatchInlineSnapshot(
      `"contracts.d.ts: 7.95 KB (8145 bytes)"`,
    );
  });
});
