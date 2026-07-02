import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
// The `[virrun]` line prefix every CLI diagnostic shares: a bold-cyan tag, then a space, then the message. Centralized
// So the tag's text and styling live in exactly one place and every stderr line (banners, results, cache/doctor/init/
// Warm/hint output) reads consistently — and is colorized identically, instead of some lines hardcoding a plain,
// Uncolored `[virrun]`. colorize is a runtime no-op when color is off (a pipe, NO_COLOR, or vitest), so callers still
// Get plain text there automatically and the format tests keep asserting plain strings.
export const formatVirrunLine = (message: string): string =>
  `${colorize(colorize("[virrun]", Color.Cyan), Color.Bold)} ${message}`;
