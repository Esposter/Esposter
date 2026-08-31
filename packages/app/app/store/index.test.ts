import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A store's id is the one name it carries into the SSR payload and the devtools tree, and nothing derives it —
// It is typed out beside a path that already says the same thing, so the two drift silently
const DEFINE_STORE_ID_REGEX = /defineStore\("(?<id>[^"]+)"/u;
const storeDirectory = import.meta.dirname;
const storePaths = (await Array.fromAsync(glob("**/*.ts", { cwd: storeDirectory })))
  .map((storePath) => storePath.replaceAll("\\", "/"))
  .filter((storePath) => !storePath.endsWith(".test.ts"));
const stores = (
  await Promise.all(
    storePaths.map(async (storePath) => ({
      id: DEFINE_STORE_ID_REGEX.exec(await readFile(join(storeDirectory, storePath), "utf8"))?.groups?.id,
      storePath,
    })),
  )
).filter((store) => store.id !== undefined);

describe("store", () => {
  test("names every store after the path it lives at", () => {
    expect.hasAssertions();

    expect(stores.map(({ id }) => id)).toStrictEqual(
      stores.map(({ storePath }) => storePath.replace(/(?:\/index)?\.ts$/u, "")),
    );
  });

  // The glob is the whole assertion's reach, so a run that resolved nothing would pass it on an empty array
  test("finds the stores it is asserting over", () => {
    expect.hasAssertions();

    expect(stores.length).toBeGreaterThan(100);
  });
});
