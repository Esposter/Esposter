import { LEGEND_PACKAGE_ROLES, MUTED_COLOR } from "#src/services/dependencyGraph/constants";
import { PackageRoleColorsMap } from "#src/services/dependencyGraph/PackageRoleColorsMap";

// Private is carried by the outline, never by the fill — a private node keeps whatever colour its role earned —
// So the key stripes all three role fills inside one dashed cell instead of picking one of them. Drawn in a
// Single role's colour (it was the violet one) it reads as "private means library", which is the one thing this
// Key must not say, and a caption correcting it would be the picture arguing with its own swatch. The border is
// The palette's neutral for the same reason: no role owns this row.
export const getPrivateSwatch = (): string =>
  [
    `<TD BORDER="1" COLOR="${MUTED_COLOR}" STYLE="DASHED" CELLPADDING="0">`,
    '<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="0"><TR>',
    ...LEGEND_PACKAGE_ROLES.map(
      (role) => `<TD BGCOLOR="${PackageRoleColorsMap[role].deepFill}" WIDTH="8" HEIGHT="15"></TD>`,
    ),
    "</TR></TABLE></TD>",
  ].join("");
