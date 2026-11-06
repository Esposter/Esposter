import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

describe("vue-pdfjs-headless", () => {
  const distFile = resolve(import.meta.dirname, "../dist/index.js");

  test("#32 the package's build holds no renderer", () => {
    expect.hasAssertions();

    expect(readFileSync(distFile, "utf8")).not.toContain("pdfjs-dist");
  });
});
