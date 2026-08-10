import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
// A failure line: the shared `[virrun]` tag with the whole body reddened — the palette's failure role, the sibling of
// FormatVirrunDebug's dimmed one. Every surface that reports a failure renders through this (the cache commands, warm,
// A run whose backend threw, the doctor's unavailable verdict), so one failure reads identically wherever it is raised
// Instead of each site re-deciding that a caught error is red.
export const formatVirrunError = (message: string): string => formatVirrunLine(colorize(message, Color.Red));
