import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/colorize";
import { formatVirrunLine } from "@/services/cli/formatVirrunLine";
// End-of-run line pairing with formatVirrunBanner so each run brackets its output with a start + result line. A zero
// Exit is greened, a failure reddened, so success/failure is obvious without reading the number; duration is greened
// Too so the run's cost is easy to spot.
export const formatVirrunResult = ({
  command,
  durationMs,
  exitCode,
}: {
  command: readonly string[];
  durationMs: number;
  exitCode: number;
}): string => {
  const exitColor = exitCode === 0 ? Color.Green : Color.Red;
  return formatVirrunLine(
    `"${colorize(command.join(" "), Color.Yellow)}" exited ${colorize(String(exitCode), exitColor)} in ${colorize(`${durationMs}ms`, Color.Green)}`,
  );
};
