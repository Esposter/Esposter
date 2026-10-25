import type { PackageRoleColors } from "#src/models/dependencyGraph/PackageRoleColors";

// A key drawn as cells rather than as glyphs: a box-drawing character is only as good as the font the reader's
// Browser falls back to, where a filled table cell is the same rectangle everywhere. The dashed line is three
// Cells with the spacing left showing through, which is what a dash is.
export const getSwatch = ({ deepFill, stroke }: PackageRoleColors): string =>
  `<TD BGCOLOR="${deepFill}" BORDER="1" COLOR="${stroke}" WIDTH="24" HEIGHT="15"></TD>`;
