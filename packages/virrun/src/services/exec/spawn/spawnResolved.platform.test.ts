import { spawnResolved } from "#src/services/exec/spawn/spawnResolved";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { jsonDateParse } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(spawnResolved, () => {
  const IS_WIN32 = process.platform === "win32";
  const ECHO_SCRIPT = "process.stdout.write(JSON.stringify(process.argv.slice(2)));";
  // The metacharacters and quotes a shim's argument can carry. A percent sign is refused rather than escaped, so it is
  // Not among them (spawnHidden.test.ts).
  const ARGUMENTS = [
    "foo",
    "&",
    "|;",
    "<>",
    "^<",
    "!=",
    "()",
    String.raw`\*`,
    '"f"',
    "'",
    String.raw`\"`,
    "bar\\",
    '"foo|bar>baz"',
    '"(foo|bar>baz|foz)"',
    "",
    "André Cruz",
  ];
  const tracker = createTemporaryDirectoryTracker();

  afterEach(() => {
    tracker.cleanup();
  });

  // The shim is a `.cmd` under node_modules/.bin, so it takes the double escape npm's own shims need. Upstream
  // Cross-spawn runs the same round trip in its "should handle arguments with shell special chars" test.
  test.skipIf(!IS_WIN32)(
    "hands every metacharacter argument to a node_modules/.bin shim as its own argument",
    async () => {
      expect.hasAssertions();

      const directory = tracker.create();
      const binDirectory = join(directory, "node_modules", ".bin");
      mkdirSync(binDirectory, { recursive: true });
      writeFileSync(join(directory, "echo.js"), ECHO_SCRIPT);
      writeFileSync(join(binDirectory, "echo.cmd"), `@"${process.execPath}" "%~dp0..\\..\\echo.js" %*\r\n`);

      const stdout = await new Promise<string>((resolve, reject) => {
        const child = spawnResolved(join(binDirectory, "echo.cmd"), ARGUMENTS, {
          stdio: ["ignore", "pipe", "inherit"],
        });
        let output = "";
        child.stdout?.setEncoding("utf8");
        child.stdout?.on("data", (chunk: string) => {
          output += chunk;
        });
        child.on("error", reject);
        child.on("close", () => {
          resolve(output);
        });
      });

      expect(jsonDateParse(stdout)).toStrictEqual(ARGUMENTS);
    },
  );
});
