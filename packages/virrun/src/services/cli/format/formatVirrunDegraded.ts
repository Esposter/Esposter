import { Color } from "#src/models/cli/Color";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Printed when a run asked for the os backend and resolveBackend handed back native because the host probe said the
// Overlay won't mount. The degrade exists so adoption is never "broken", but silence made it indistinguishable from a
// Working sandbox that had nothing to say: the provisioning and prepare lines are os-only, so their absence was the
// Only symptom, and a stale capability verdict could keep a perfectly capable host native for the cache's whole
// Window with nothing on screen. Yellowed like the other "this run costs more than you expect" lines, and it names
// `virrun doctor` because that is the surface that says WHICH prerequisite is missing.
export const formatVirrunDegraded = (): string =>
  formatVirrunLine(
    colorize(
      "os backend unavailable — running native (un-isolated); run `virrun doctor` to see what's missing",
      Color.Yellow,
    ),
  );
