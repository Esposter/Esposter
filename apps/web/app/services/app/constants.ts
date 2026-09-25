import type { FrecencyBucket } from "@/models/app/FrecencyBucket";

import { RoutePath } from "@esposter/shared";

// Marks a page's composer, so the dock can step aside on a narrow screen while focus is inside one
export const COMPOSER_ATTRIBUTE = "data-composer";
export const SCROLL_TO_TOP_VISIBLE_OFFSET = 200;
// Firefox's address bar ranking: a visit counts for less the longer ago the last one was, so a page visited often
// Last month ranks below one visited a few times this week. Past the last bucket a visit keeps the oldest weight
export const FRECENCY_BUCKETS: readonly FrecencyBucket[] = [
  { maxAgeMs: Temporal.Duration.from({ days: 4 }).total("milliseconds"), weight: 100 },
  { maxAgeMs: Temporal.Duration.from({ days: 14 }).total("milliseconds"), weight: 70 },
  { maxAgeMs: Temporal.Duration.from({ days: 31 }).total("milliseconds"), weight: 50 },
  { maxAgeMs: Temporal.Duration.from({ days: 90 }).total("milliseconds"), weight: 30 },
];
export const FRECENCY_OLDEST_WEIGHT = 10;
export const RECENT_PAGES_SHOWN_LIMIT = 5;
export const RECENT_PAGES_STORED_LIMIT = 50;
// Home is the logo and signing in is a step on the way somewhere, so neither is a place a reader comes back to
export const RECENT_PAGE_EXCLUDED_PATHS: readonly string[] = [RoutePath.Index, RoutePath.Login];
// The status an error carries when it names none, as `createError` itself defaults it
export const DEFAULT_ERROR_STATUS_CODE = 500;
// The voxel digits a status page draws its code in: each is this many blocks wide, and each column lands this long
// After the one to its left
export const VOXEL_DIGIT_WIDTH = 3;
export const VOXEL_DROP_STAGGER_MS = Temporal.Duration.from({ milliseconds: 40 }).total("milliseconds");
// The dock's panels open beside it: right of the rail, extending down, flipped up above the bottom bar
export const DOCK_POPOVER_POSITION_AREA = "right span-bottom";
// The one key that opens the command palette on every page
export const COMMAND_PALETTE_SHORTCUT = "ctrl+k";
// The palette's own headings: the reader's account, the pages outside the products, the pages they keep coming back
// To, the theme and style choices, and the commands every page has
export const ACCOUNT_COMMAND_GROUP = "Account";
export const GENERAL_COMMAND_GROUP = "General";
export const PAGES_COMMAND_GROUP = "Pages";
export const PLACES_COMMAND_GROUP = "Places";
export const STYLE_COMMAND_GROUP = "Style";
export const THEME_COMMAND_GROUP = "Theme";
