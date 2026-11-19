import { glob, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// A store's id is the one name it carries into the SSR payload and the devtools tree. Nothing can derive it: a helper
// Cannot read it from the file, since `import.meta.url` in a built bundle is the chunk's URL, and a build transform or
// A cast would stand in for the literal `defineStore` types. So each id is typed beside its path, and this test is
// What stops the two drifting apart
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

    expect(stores.map(({ id }) => id)).toContain("alert");
  });
});
