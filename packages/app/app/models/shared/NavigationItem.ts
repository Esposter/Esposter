export interface NavigationItem {
  icon: string;
  // Explicit rather than left to the router: a link's own match cannot express a parent that must only light
  // On its exact path, and `v-list-item` lets the passed value win over the link either way
  isActive: boolean;
  title: string;
  to: string;
}
