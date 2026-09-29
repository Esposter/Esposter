import { getFileSizeReport } from "@esposter/configuration";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("agent-console-server", () => {
  const distDirectory = resolve(import.meta.dirname, "../dist");

  test("bundle size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.js"))).toMatchInlineSnapshot(
      `"index.js: 11.27 KB (11543 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.js"))).toMatchInlineSnapshot(
      `"contracts.js: 5.97 KB (6112 bytes)"`,
    );
  });

  test("types size", () => {
    expect.hasAssertions();

    expect(getFileSizeReport(resolve(distDirectory, "index.d.ts"))).toMatchInlineSnapshot(
      `"index.d.ts: 38.67 KB (39599 bytes)"`,
    );
    expect(getFileSizeReport(resolve(distDirectory, "contracts.d.ts"))).toMatchInlineSnapshot(
      `"contracts.d.ts: 9.20 KB (9417 bytes)"`,
    );
  });
});
