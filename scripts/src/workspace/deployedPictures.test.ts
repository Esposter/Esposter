import { NAMECARD_ART_PREFIX } from "#src/services/genshinAssets/namecards/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { describe, expect, test } from "vitest";

const listFiles = (directory: string): string[] =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));

// The files the app serves are the static folders Nuxt publishes as they are. A picture the game draws is never one of
// Them: its portraits, card faces and namecard pictures are measured for stand-ins, not shipped
describe("deployedPictures", () => {
  const SERVED_DIRECTORIES = ["apps/web/public", "apps/web/app/assets"];
  const GAME_PICTURE_PREFIXES = ["UI_AvatarIcon_", "Gcg_CardFace_", NAMECARD_ART_PREFIX];

  test("the deployed files hold no portrait, card face or namecard picture", () => {
    expect.hasAssertions();

    const servedFiles = SERVED_DIRECTORIES.flatMap((directory) => listFiles(join(REPOSITORY_ROOT, directory)));

    expect(
      servedFiles.filter((file) => GAME_PICTURE_PREFIXES.some((prefix) => basename(file).startsWith(prefix))),
    ).toStrictEqual([]);
  });
});
