import type { PackageRoleColors } from "#scripts/dependencyGraph/models/PackageRoleColors";

import { MUTED_COLOR, RUNTIME_EDGE_COLOR } from "#scripts/dependencyGraph/constants";
import { PackageRole } from "#scripts/dependencyGraph/models/PackageRole";
import { PackageRoleColorsMap } from "#scripts/dependencyGraph/PackageRoleColorsMap";

// A key drawn as cells rather than as glyphs: a box-drawing character is only as good as the font the reader's
// Browser falls back to, where a filled table cell is the same rectangle everywhere. The dashed line is three
// Cells with the spacing left showing through, which is what a dash is.
const getSwatch = ({ deepFill, stroke }: PackageRoleColors): string =>
  `<TD BGCOLOR="${deepFill}" BORDER="1" COLOR="${stroke}" WIDTH="24" HEIGHT="15"></TD>`;
// The roles in the order their rows are drawn above, so the striped swatch below reads as those three keys
// Restated rather than as a fourth palette.
const LEGEND_PACKAGE_ROLES: PackageRole[] = [PackageRole.Entrypoint, PackageRole.Library, PackageRole.Foundation];
// Private is carried by the outline, never by the fill — a private node keeps whatever colour its role earned —
// So the key stripes all three role fills inside one dashed cell instead of picking one of them. Drawn in a
// Single role's colour (it was the violet one) it reads as "private means library", which is the one thing this
// Key must not say, and a caption correcting it would be the picture arguing with its own swatch. The border is
// The palette's neutral for the same reason: no role owns this row.
const getPrivateSwatch = (): string =>
  [
    `<TD BORDER="1" COLOR="${MUTED_COLOR}" STYLE="DASHED" CELLPADDING="0">`,
    '<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0"><TR>',
    ...LEGEND_PACKAGE_ROLES.map(
      (role) => `<TD BGCOLOR="${PackageRoleColorsMap[role].deepFill}" WIDTH="8" HEIGHT="15"></TD>`,
    ),
    "</TR></TABLE></TD>",
  ].join("");
const getLine = (color: string, widths: number[]): string =>
  [
    '<TD><TABLE BORDER="0" CELLBORDER="0" CELLSPACING="3" CELLPADDING="0"><TR>',
    ...widths.map((width) => `<TD BGCOLOR="${color}" HEIGHT="4" WIDTH="${String(width)}"></TD>`),
    "</TR></TABLE></TD>",
  ].join("");
// One key per row rather than a strip of them. Graphviz sizes the table with its own Helvetica metrics and the
// Reader's browser resolves that name to whatever it has, so any row holding two keys side by side is one font
// Substitution away from the first key's text running into the second key's swatch. A row that ends in text
// Cannot collide with anything.
const getRow = (sample: string, text: string): string => `<TR>${sample}<TD ALIGN="LEFT">${text}</TD></TR>`;
// The graph's own label rather than a cluster of sample nodes: a label is laid out after the graph is, so the
// Key cannot push a rank around or land in the middle of the picture the way an unconnected subgraph does.
export const getLegendLabel = (): string =>
  [
    '<<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="5" CELLPADDING="3">',
    getRow(
      getSwatch(PackageRoleColorsMap[PackageRole.Entrypoint]),
      "entrypoint &#183; nothing in the workspace depends on it",
    ),
    getRow(getSwatch(PackageRoleColorsMap[PackageRole.Library]), "library &#183; depended on, and depending"),
    getRow(getSwatch(PackageRoleColorsMap[PackageRole.Foundation]), "foundation &#183; reaches no sibling at runtime"),
    getRow(getPrivateSwatch(), "dashed outline &#183; private, never published"),
    getRow(getLine(RUNTIME_EDGE_COLOR, [26]), "runtime dependency"),
    getRow(getLine(MUTED_COLOR, [7, 7, 7]), "development-only dependency"),
    "</TABLE>>",
  ].join("");
