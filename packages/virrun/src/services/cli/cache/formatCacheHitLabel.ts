import { Color } from "@/models/cli/Color";
import { colorize } from "@/services/cli/color/colorize";
// The fast-route emphasis shared by every cache/snapshot HIT label (blue + bold): a reused snapshot or a replayed task
// Is the win, so it stands out instead of being dimmed as background noise. Both `snapshot cache hit` and `task cache
// Hit` render through this so the two fast paths read identically. Blue+Bold is the palette's "fast-route hit" role.
export const formatCacheHitLabel = (label: string): string => colorize(colorize(label, Color.Blue), Color.Bold);
