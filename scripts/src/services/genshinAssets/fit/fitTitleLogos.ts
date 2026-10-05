import { GAME_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/genshinAssets/shared/runAnimeStudio";
import { traceImage } from "#src/services/genshinParity/shared/traceImage";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The login interface's block, which holds the title logos the interface picks between by language
const LOGIN_INTERFACE_BLOCK = join("00", "11790361.blk");
// Every logo is traced at four times its sprite's size with the ink split halfway, since the sprites are clean renders
const TRACE_SCALE = 4;
const INK_SHARE = 0.5;
// Each title logo by the sprite its client's interface shows and, under a Chinese, Japanese or Korean mark, its Latin
// Line's region on the sprites' shared 1024 by 688 canvas, the ink's box with a margin of 4. Traced as part of the
// Whole canvas, that line's i's dots fall under the share of it taken for a speck, so it is traced again on its own and
// Spliced in
const TITLE_LOGO_SPRITES: { latinRegion?: [number, number, number, number]; logo: string; sprite: string }[] = [
  { logo: "ChineseSimplified", sprite: "Logo_CHS_Pure" },
  { latinRegion: [187, 525, 493, 54], logo: "ChineseTraditional", sprite: "Logo_CHT_Pure" },
  { logo: "English", sprite: "Logo_ENG_Pure" },
  { latinRegion: [195, 516, 448, 59], logo: "Japanese", sprite: "Logo_JPN_Pure" },
  { latinRegion: [301, 536, 228, 94], logo: "Korean", sprite: "Logo_KOR_Pure" },
];
const NUMBER_REGEX = /-?\d+(?:\.\d+)?/gu;
const splitSubpaths = (path: string): string[] =>
  path
    .split(/(?=M )/u)
    .map((subpath) => subpath.trim())
    .filter(Boolean);
const getBox = (subpath: string): { bottom: number; left: number; right: number; top: number } => {
  const numbers = Array.from(subpath.matchAll(NUMBER_REGEX), ([value]) => Number(value));
  const xs = numbers.filter((_value, index) => index % 2 === 0);
  const ys = numbers.filter((_value, index) => index % 2 === 1);
  return { bottom: Math.max(...ys), left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys) };
};
const shiftSubpath = (subpath: string, x: number, y: number): string => {
  let index = 0;
  return subpath.replaceAll(NUMBER_REGEX, (value) => String(Number(value) + (index++ % 2 === 0 ? x : y)));
};

// Each title logo as one filled path on the sprites' shared canvas at the trace's scale, by its `TitleLogo`: its sprite
// Exported from the installed game into the component's folder, flattened on black since it is white on transparency,
// And traced
export const fitTitleLogos = async (directory: string): Promise<Record<string, string>> => {
  const spriteDirectory = join(directory, "titleLogos");
  await mkdir(spriteDirectory, { recursive: true });
  runAnimeStudio([
    join(GAME_BLOCKS_DIRECTORY, LOGIN_INTERFACE_BLOCK),
    spriteDirectory,
    "--names",
    `^(${TITLE_LOGO_SPRITES.map(({ sprite }) => sprite).join("|")})$`,
    "--types",
    "Texture2D",
    "--group_assets",
    "ByType",
  ]);
  const entries = await Promise.all(
    TITLE_LOGO_SPRITES.map(async ({ latinRegion, logo, sprite }) => {
      const flattenedPath = join(spriteDirectory, `${sprite}.png`);
      const { height, width } = await sharp(join(spriteDirectory, "Texture2D", `${sprite}.png`))
        .flatten({ background: "#000" })
        .toFile(flattenedPath);
      const subpaths = splitSubpaths(await traceImage(flattenedPath, 0, 0, width, height, TRACE_SCALE, INK_SHARE));
      if (!latinRegion) return [logo, subpaths.join(" ")] as const;
      const [x, y, regionWidth, regionHeight] = latinRegion;
      const left = x * TRACE_SCALE;
      const top = y * TRACE_SCALE;
      const right = (x + regionWidth) * TRACE_SCALE;
      const bottom = (y + regionHeight) * TRACE_SCALE;
      const latinSubpaths = splitSubpaths(
        await traceImage(flattenedPath, x, y, regionWidth, regionHeight, TRACE_SCALE, INK_SHARE),
      );
      const outsideSubpaths = subpaths.filter((subpath) => {
        const box = getBox(subpath);
        return box.left < left || box.top < top || box.right > right || box.bottom > bottom;
      });
      return [
        logo,
        [...outsideSubpaths, ...latinSubpaths.map((subpath) => shiftSubpath(subpath, left, top))].join(" "),
      ] as const;
    }),
  );
  return Object.fromEntries(entries);
};
