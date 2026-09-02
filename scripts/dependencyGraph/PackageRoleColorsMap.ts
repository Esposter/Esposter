import type { PackageRoleColors } from "#scripts/dependencyGraph/models/PackageRoleColors";

import { PackageRole } from "#scripts/dependencyGraph/models/PackageRole";

// Two stops and a border per role. Graphviz reads a `pale:deep` pair as a gradient, and at `gradientangle=270`
// That is a face lit from above, which is the direction the `box3d` fold already implies. The border is a deeper
// Cut of the same hue so a node reads as one colour rather than as a swatch inside a frame, and every stop is
// Opaque and pale enough to take the near-black label — which is what lets one committed svg sit on either
// Background.
export const PackageRoleColorsMap: Record<PackageRole, PackageRoleColors> = {
  [PackageRole.Entrypoint]: { deepFill: "#ffdca8", paleFill: "#fff1d6", stroke: "#c07f1c" },
  [PackageRole.Foundation]: { deepFill: "#b3e4cb", paleFill: "#ddf3e8", stroke: "#2f9e6b" },
  [PackageRole.Library]: { deepFill: "#c2d9f9", paleFill: "#e7f1fe", stroke: "#3d7dd8" },
};
