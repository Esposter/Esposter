import type { PackageRoleColors } from "#scripts/dependencyGraph/models/PackageRoleColors";

import { PackageRole } from "#scripts/dependencyGraph/models/PackageRole";

// Two stops and a border per role. Graphviz reads a `pale:deep` pair as a gradient, and at `gradientangle=270`
// That is a face lit from above, which is the direction the `box3d` fold already implies. The border is a deeper
// Cut of the same hue so a node reads as one colour rather than as a swatch inside a frame, and every stop is
// Opaque and pale enough to take the near-black label — which is what lets one committed svg sit on either
// Background.
//
// Role is carried by lightness as well as hue, and the lightness is the half that does the work: a dichromat
// Sees two dimensions, so three hues at one lightness cannot be told apart under protanopia, deuteranopia and
// Tritanopia at once — searched exhaustively, the best such triple separates by ΔE 2.4, and the amber/mint/
// Periwinkle set this replaces fell to 10 under protanopia and to 0 under tritanopia, where mint and periwinkle
// Were the same colour. Rose, violet and mint on a 74/82/90 lightness ramp hold a floor of ΔE 14.9 across all
// Three, and the ramp is not arbitrary: weight runs down the dependency direction, so what the repo ships is
// Heaviest and the scaffolding everything rests on recedes. Every border also clears 3:1 against both a white
// And a near-black page. Re-measure before moving any of them.
export const PackageRoleColorsMap: Record<PackageRole, PackageRoleColors> = {
  [PackageRole.Entrypoint]: { deepFill: "#eea0b7", paleFill: "#eac2cc", stroke: "#b33a6a" },
  [PackageRole.Foundation]: { deepFill: "#c0efba", paleFill: "#e3fadf", stroke: "#4d994c" },
  [PackageRole.Library]: { deepFill: "#d7c2fd", paleFill: "#e9defb", stroke: "#7f65bd" },
};
