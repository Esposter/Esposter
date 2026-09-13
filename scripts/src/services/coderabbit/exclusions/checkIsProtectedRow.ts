import type { NameStatusRow } from "#src/models/coderabbit/exclusions/NameStatusRow";

import { checkIsProtectedPath } from "#src/services/coderabbit/exclusions/checkIsProtectedPath";

// A row is tested at both ends: a rename out of a protected tree is still a change to that tree, whatever the
// Path it ends at looks like (`checkIsProtectedPath`)
export const checkIsProtectedRow = ({ path, renamedFrom }: NameStatusRow): boolean =>
  checkIsProtectedPath(path) || (renamedFrom !== undefined && checkIsProtectedPath(renamedFrom));
