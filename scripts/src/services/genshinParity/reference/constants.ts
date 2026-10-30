import type { ParityApproval } from "#src/models/genshinParity/shared/ParityApproval";

import { ParityApprovalMeasure } from "#src/models/genshinParity/reference/ParityApprovalMeasure";
import { PARITY_SHARED_DIRECTORY, STRUCTURE_WIDTH } from "#src/services/genshinParity/shared/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join, relative } from "node:path";

// The detail read at twice the structure's width, where a stone's carving and its courses still show
export const DETAIL_WIDTH: number = STRUCTURE_WIDTH * 2;

// The hex digits of a reference's content hash kept in its cache name
export const DIGEST_LENGTH = 16;

// Each image of a comparison is drawn this high, side by side
export const COMPARISON_HEIGHT = 540;

// The mean difference, in percent, a shot must score under its reference to be within the bar: one percent is the 99%
// Likeness the screens are held to. A reference that records its own bar keeps that bar instead
const APPROVAL_MEAN_DIFFERENCE_BAR = 1;

// The bar a screen is set against when its reference records none
export const DEFAULT_APPROVAL: ParityApproval = Object.freeze({
  bar: APPROVAL_MEAN_DIFFERENCE_BAR,
  measure: ParityApprovalMeasure.MeanDifference,
} satisfies ParityApproval);

// The name the report and its map share, before the extension each is written under
const PARITY_SCORES_NAME = "ParityReferenceMap";
// The committed report of every reference's last scores, beside the map naming them
export const PARITY_SCORES_PATH: string = join(PARITY_SHARED_DIRECTORY, `${PARITY_SCORES_NAME}.snapshot.md`);
// The report is formatted under the markdown name the formatter does not skip, since a snapshot is written verbatim. The
// Path is repository-relative, as the formatter reads its ignores from it, and a worktree's own path sits under
// `.agents/worktrees`, which the config ignores
export const PARITY_SCORES_FORMAT_PATH: string = relative(
  REPOSITORY_ROOT,
  join(PARITY_SHARED_DIRECTORY, `${PARITY_SCORES_NAME}.md`),
).replaceAll("\\", "/");

// The conversion a frame is cut with, its colour tags set to unknown so a browser does not colour-manage the cut
export const RECORDING_FRAME_FILTER =
  "format=rgb24,setparams=color_primaries=unknown:color_trc=unknown:colorspace=unknown";

// The largest mean difference, in percent of full scale, a reference may have from the frame its source names.
// A cut of that frame stays well under half a percent from it, and a different picture scores in the tens of percent.
// One percent therefore admits every cut of the frame and fails any other picture
export const VERIFY_TOLERANCE_PERCENT = 1;

// The lossless WebP a reference is packed as, at the highest effort sharp offers. Its pixels decode back exactly, so every
// Score reads the same as it did from the screenshot
export const REFERENCE_WEBP_OPTIONS = { effort: 6, lossless: true } as const;

// How many files `references pack` writes and `references restore` moves at once.
// How many of the largest files the pack table names.
export const REFERENCE_PACK_CONCURRENCY = 2;
export const REFERENCE_PACK_LARGEST_COUNT = 10;
// How many leading hex digits of a hash a colliding id names, enough to tell two apart at a glance
export const SHORT_HASH_LENGTH = 8;

// A reference's source as the map writes it, `<file> at <N>s`, with `, cropped to WxH from X,Y` when the frame is cropped
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const RECORDING_SOURCE_REGEX: RegExp =
  /^(?<file>\S+) at (?<seconds>\d+(?:\.\d+)?)s(?:, cropped to (?<cropWidth>\d+)x(?<cropHeight>\d+) from (?<cropX>\d+),(?<cropY>\d+))?$/u;

// A public recording's file name as the clip tool and the capture step write it.
// It is `yt-<id>-<name>.<ext>` or `bili-<id>-<name>.<ext>`.
// A YouTube id is eleven characters.
// The yt prefix refuses a Bilibili id, which the clip tool writes under it for a Bilibili URL.
// A Bilibili id is `av` and its digits or `BV` and its characters.
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const YOUTUBE_RECORDING_NAME_REGEX: RegExp = /^yt-(?!av\d+-)(?<id>[\w-]{11})-(?<name>[\w-]+)\.[\da-z]+$/u;
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const BILIBILI_RECORDING_NAME_REGEX: RegExp = /^bili-(?<id>av\d+|BV[\dA-Za-z]+)-(?<name>[\w-]+)\.[\da-z]+$/u;

// The language a reference's id names it in, by the word its id carries, as its language tag
export const REFERENCE_ID_LANGUAGE_TAGS: Readonly<Record<string, string>> = {
  english: "en",
  japanese: "ja",
  korean: "ko",
};

// A clean plate cached in the scratch folder, named by the digest of what it is filled from
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex literal would otherwise infer
export const PLATE_CACHE_REGEX: RegExp = /\.plate-[\da-f]{16}\.png$/u;

// The folder the game-data container keeps every stored object in, one per hash and extension, whatever its kind
export const REFERENCE_BLOB_FOLDER = "parityObjects";
// Every committed reference is lossless WebP, the format `packReferenceImage` writes, and its file name ends with it
export const REFERENCE_FILE_EXTENSION = "webp";
// A plate is committed flat in the references folder, named by its id with this suffix before the extension
export const REFERENCE_PLATE_SUFFIX = ".plate";
// The largest committed file the tree may hold is the largest lossless reference, `mondstadt-city-location`.
// That reference runs to 7,315,020 bytes, and the limit is that size with a margin above it.
// So a larger file is a mistake to look at rather than a size to accept.
export const REFERENCE_FILE_MAX_BYTES = 7_500_000;
// A stored object runs to several megabytes, which the default request bound of ten seconds cuts short on a slow link
export const OBJECT_DOWNLOAD_TIMEOUT_MS: number = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// The leading bytes each sniffed format is recognised by: a hex signature found at its offset in the file
export const FILE_SIGNATURES: readonly { extension: string; hex: string; offset: number }[] = [
  { extension: "png", hex: "89504e47", offset: 0 },
  { extension: "gif", hex: "47494638", offset: 0 },
  { extension: "jpg", hex: "ffd8ff", offset: 0 },
  { extension: "webp", hex: "57454250", offset: 8 },
  { extension: "mkv", hex: "1a45dfa3", offset: 0 },
  { extension: "mp4", hex: "66747970", offset: 4 },
  { extension: "zip", hex: "504b0304", offset: 0 },
];
// How many leading bytes a sniff reads, enough for every signature above
export const SNIFF_HEAD_LENGTH = 16;

// The sections the committed manifest writes, in the order its file holds them, which the formatter follows. No object
// Literal carries that order, so the file reads the same whichever order the lint sorts a literal's keys into
export const REFERENCE_MANIFEST_SECTIONS: readonly ["records", "recordings", "references"] = [
  "records",
  "recordings",
  "references",
];
