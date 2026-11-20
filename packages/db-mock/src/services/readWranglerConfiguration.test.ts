import { readWranglerConfiguration } from "#src/services/readWranglerConfiguration";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, onTestFinished, test } from "vitest";

describe(readWranglerConfiguration, () => {
  // The trailing comma of each container goes, and a comma inside a string literal stays as the file wrote it
  test("removes trailing commas and keeps a comma that sits inside a string", () => {
    expect.hasAssertions();

    const directory = mkdtempSync(join(tmpdir(), "wrangler-configuration-"));
    onTestFinished(() => {
      rmSync(directory, { force: true, recursive: true });
    });
    const path = join(directory, "wrangler.jsonc");
    writeFileSync(path, '{\n  "pattern": "a,]",\n  "routes": ["x", "y",],\n}\n');

    expect(readWranglerConfiguration(path)).toStrictEqual({ pattern: "a,]", routes: ["x", "y"] });
  });
});
