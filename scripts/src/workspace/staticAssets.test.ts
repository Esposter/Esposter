import { UNCOMPRESSED_AUDIO_EXTENSIONS } from "#src/services/hostedAssets/constants";
import { MEBIBYTE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readRepositoryFile } from "#src/workspace/readRepositoryFile.test";
import { statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Every file in these folders is shipped to the browser: the app's own assets are bundled and served from the edge, and
 * `public/` is served as it is. A file over the limit is left out of the service worker, and an uncompressed audio file
 * is many times the size of the same sound in MP3, so both are checked here rather than trusted to review. A file over
 * the limit that the bundle must not hold is hosted instead (`openspec/changes/architecture-hosted-assets/design.md`).
 */
describe("staticAssets", () => {
  const BUNDLED_PATHSPECS = ["apps/web/app/assets"];
  const PUBLIC_PATHSPECS = ["apps/web/public"];
  // The service worker precaches a build's code, styles, images and fonts only up to this size, and leaves a larger one
  // Out of its list (`apps/web/configuration/pwa.ts`). The bundle holds a file only up to the same figure, so one limit
  // Is the budget
  const SIZE_LIMIT_BYTES = 2 * MEBIBYTE;

  const ENGINE_LOADER_PATHSPECS = ["apps/web/app/services/dungeons/loader"];
  // A loader names a file in a static import, a dynamic import or an import.meta.glob.
  // A glob names its files in one string or in an array of them, so every string in its argument is read
  // An array's strings are read whole, so a bracket inside one (a character class such as `[a-c]`) does not end the
  // Array
  const LOADED_SPECIFIER_REGEX =
    /(?:\bfrom |\bimport\(\s*)"(?<specifier>[^"]+)"|\bimport\.meta\.glob(?:<[^>]*>)?\(\s*(?<argument>\[(?:[^"\]]|"[^"]*")*\]|"[^"]+")/gu;
  const QUOTED_REGEX = /"(?<quoted>[^"]+)"/gu;
  const HOSTED_MEDIA_REGEX = /\.(?:mp3|ogg|png|tmx|tsx|webp|woff2)(?:\?|$)|tilemap\.json(?:\?|$)/u;

  const getLoadedSpecifiers = (source: string): string[] =>
    [...source.matchAll(LOADED_SPECIFIER_REGEX)].flatMap(({ groups }) =>
      groups?.specifier === undefined
        ? Array.from((groups?.argument ?? "").matchAll(QUOTED_REGEX), ({ groups: quoted }) => quoted?.quoted ?? "")
        : [groups.specifier ?? ""],
    );

  const getHostedSpecifiers = (source: string): string[] =>
    getLoadedSpecifiers(source).filter((specifier) => HOSTED_MEDIA_REGEX.test(specifier));

  const checkIsOversizedOrUncompressed = (path: string): boolean =>
    statSync(join(REPOSITORY_ROOT, path)).size > SIZE_LIMIT_BYTES || UNCOMPRESSED_AUDIO_EXTENSIONS.has(extname(path));

  test("a small UI icon is bundled", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...BUNDLED_PATHSPECS).filter((path) => checkIsOversizedOrUncompressed(path)),
    ).toStrictEqual([]);
  });

  test("no public file is over the limit or uncompressed audio", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...PUBLIC_PATHSPECS).filter((path) => checkIsOversizedOrUncompressed(path)),
    ).toStrictEqual([]);
  });

  // An engine loader reads each hosted file by its url from the key map. A loader that names one by its path puts
  // The file back into the bundle, which the hosted objects exist to keep out
  test("an engine-read texture is hosted", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...ENGINE_LOADER_PATHSPECS)
        .filter((path) => extname(path) === ".ts")
        .flatMap((path) => getHostedSpecifiers(readRepositoryFile(path)).map((specifier) => `${path}: ${specifier}`)),
    ).toStrictEqual([]);
  });

  test("a loader that names a hosted file by a glob or a dynamic import is flagged", () => {
    expect.hasAssertions();

    expect(
      getHostedSpecifiers(
        [
          'import tileset from "#src/assets/dungeons/tilesets/Dungeon.tsx";',
          'const frames = import.meta.glob("#src/assets/dungeons/scene/**/*.png", { eager: true });',
          'const props = import.meta.glob<string>("#src/assets/dungeons/props/*.png", { eager: true, import: "default" });',
          'const sheet = await import("#src/assets/dungeons/sheet.webp");',
          'const tiles = import.meta.glob(["#src/assets/dungeons/tiles/*.png", "./local.ts"]);',
          'const bracketed = import.meta.glob(["#src/assets/dungeons/tiles/[a-c]*.png"]);',
        ].join("\n"),
      ),
    ).toStrictEqual([
      "#src/assets/dungeons/tilesets/Dungeon.tsx",
      "#src/assets/dungeons/scene/**/*.png",
      "#src/assets/dungeons/props/*.png",
      "#src/assets/dungeons/sheet.webp",
      "#src/assets/dungeons/tiles/*.png",
      "#src/assets/dungeons/tiles/[a-c]*.png",
    ]);
  });
});
