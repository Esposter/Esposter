import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("websocket", () => {
  const WEBSOCKET_SOURCE_PATHS = [
    "websocket.ts",
    "models/WebSocketClientAdapter.ts",
    "models/WebSocketServerAdapter.ts",
  ];
  const IMPORT_SPECIFIER_REGEX = /\bfrom\s+"(?<specifier>[^"]+)"/gu;

  // A Worker bundle takes this subpath, so a specifier outside this package's own source would drag its tooling in
  test("imports nothing from outside its own source but node:events", () => {
    expect.hasAssertions();

    const specifiers = WEBSOCKET_SOURCE_PATHS.flatMap((path) =>
      Array.from(
        readFileSync(join(import.meta.dirname, path), "utf8").matchAll(IMPORT_SPECIFIER_REGEX),
        ({ groups }) => groups?.specifier,
      ),
    ).filter((specifier): specifier is string => specifier !== undefined && !specifier.startsWith("#src/"));

    expect([...new Set(specifiers)]).toStrictEqual(["node:events"]);
  });
});
