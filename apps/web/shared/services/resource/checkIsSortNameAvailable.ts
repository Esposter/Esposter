import type { ResourceListSortName } from "#shared/models/resource/ResourceListSortName";

import { ResourceSortName } from "#shared/models/resource/ResourceSortName";

// The last-accessed orders hold only the resources the owner has opened, since their key is null for the rest. So a list
// Takes one only with the accessed filter, and every other order is available to every list
export const checkIsSortNameAvailable = (sortName: ResourceListSortName, isAccessed?: boolean) =>
  isAccessed === true ||
  (sortName !== ResourceSortName.LastAccessedAtAsc && sortName !== ResourceSortName.LastAccessedAtDesc);
