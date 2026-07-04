import { formatVirrunDebug } from "@/services/cli/format/formatVirrunDebug";
import { VIRRUN_DEBUG_KEY } from "@/services/exec/util/constants";
// Print one debug diagnostic to stderr (where every other virrun diagnostic goes, so stdout stays the command's own),
// Gated on VIRRUN_DEBUG / `virrun run --debug`. The single sink for tracing silently-degrading decisions — e.g. the
// Task cache's off/skip/record/fail branches, which are best-effort by design and otherwise invisible. Call sites keep
// Messages to one concise line: the decision and its cause, no payload dumps.
export const writeVirrunDebug = (message: string): void => {
  if (process.env[VIRRUN_DEBUG_KEY] === undefined) return;
  process.stderr.write(`${formatVirrunDebug(message)}\n`);
};
