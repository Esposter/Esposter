import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
import { formatVirrunLine } from "@/services/cli/format/formatVirrunLine";
// Printed (stderr) when a cached run FAILS reaching the network. A cached run is sandboxed offline so its result stays
// Determined by (lockfile + source + command) alone; a command that needs the registry (e.g. `pnpm outdated`) then dies
// With its own opaque error. Surface the real cause + the fix, a "did you mean" in the shape of getCommandNotFoundHint.
// Lead with NATIVE (drop the `virrun --` prefix): a network command rarely benefits from the sandbox — it can't be
// Cached, and under an `environment` preset it still pays the full prepare rebuild — so the prefix is usually pure
// Overhead. `--no-cache` is the fallback for the rarer "needs network AND the sandbox" case (e.g. an integration test).
export const formatVirrunNetworkHint = (command: readonly string[] | string): string =>
  [
    formatVirrunLine(
      `"${colorize(typeof command === "string" ? command : command.join(" "), Color.Yellow)}" tried to use the network, but cached runs are sandboxed offline so results stay reproducible.`,
    ),
    formatVirrunLine(
      `If it needs the network, run it natively — drop the ${colorize("virrun --", Color.Yellow)} prefix — or, to keep the sandbox, re-run uncached with ${colorize("virrun --no-cache --", Color.Yellow)} (or ${colorize("VIRRUN_NO_CACHE=1", Color.Yellow)}).`,
    ),
  ].join("\n");
