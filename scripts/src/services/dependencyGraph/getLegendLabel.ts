import { PackageRole } from "#src/models/dependencyGraph/PackageRole";
import { MUTED_COLOR, RUNTIME_EDGE_COLOR } from "#src/services/dependencyGraph/constants";
import { getLine } from "#src/services/dependencyGraph/getLine";
import { getPrivateSwatch } from "#src/services/dependencyGraph/getPrivateSwatch";
import { getRow } from "#src/services/dependencyGraph/getRow";
import { getSwatch } from "#src/services/dependencyGraph/getSwatch";
import { PackageRoleColorsMap } from "#src/services/dependencyGraph/PackageRoleColorsMap";

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
