import { Color } from "#src/models/cli/Color";
import { formatCacheHitLabel } from "#src/services/cli/cache/formatCacheHitLabel";
import { colorize } from "#src/services/cli/color/colorize";
import { formatVirrunLine } from "#src/services/cli/format/formatVirrunLine";
// Printed after formatVirrunProvisioning when an environment preset is active, so the source-keyed prepare layer
// (e.g. Nuxt's .nuxt) is as observable as the deps snapshot: a `prepare cache hit` (blue-bold) reuses the layer
// Built for the current source state, while a `prepare cache miss` (yellowed) regenerates it — expected on a first
// Run and after any source edit, since the layer key moves with the working-tree hash. The key is source-derived
// (lockfile + source-tree + prepare step), so its short prefix identifies the layer without restating the inputs.
export const formatVirrunPrepare = ({ exists, key }: { exists: boolean; key: string }): string => {
  const source = colorize(key.slice(0, 12), Color.Blue);
  return exists
    ? formatVirrunLine(`${formatCacheHitLabel("prepare cache hit")} (source ${source})`)
    : formatVirrunLine(
        colorize(`prepare cache miss (source ${source}) — regenerating framework artifacts once`, Color.Yellow),
      );
};
