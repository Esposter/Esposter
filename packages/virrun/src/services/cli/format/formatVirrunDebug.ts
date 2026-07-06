import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
// A debug diagnostic line: the shared `[virrun]` tag, then the whole `debug — <message>` body dimmed — debug lines are
// Background noise next to the banner/result pair, so they recede instead of competing with the blue-bold hit labels.
// Pure formatting; the VIRRUN_DEBUG gate lives in writeVirrunDebug.
export const formatVirrunDebug = (message: string): string =>
  formatVirrunLine(colorize(`debug — ${message}`, Color.Dim));
