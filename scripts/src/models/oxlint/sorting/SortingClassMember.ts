import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";

export interface SortingClassMember extends SortingGroupItem {
  // Whether the member is static, which decides the members a `this` or a class-name read can reach
  isStatic: boolean;
}
