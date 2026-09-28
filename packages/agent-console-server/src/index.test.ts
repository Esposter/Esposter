import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.js"))).toMatchInlineSnapshot(
      `"index.js: 11.28 KB (11554 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.js"))).toMatchInlineSnapshot(
      `"contracts.js: 5.95 KB (6089 bytes)"`,
    );
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.d.ts"))).toMatchInlineSnapshot(
      `"index.d.ts: 38.67 KB (39603 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.d.ts"))).toMatchInlineSnapshot(
      `"contracts.d.ts: 9.20 KB (9421 bytes)"`,
    );
  });
});
