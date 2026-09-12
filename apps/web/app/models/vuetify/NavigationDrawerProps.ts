import type { Except } from "type-fest";
import type { VNavigationDrawer } from "vuetify/components";

// `StyledNavigationDrawer` owns the open state, so a caller styles and positions the drawer through this bag
// But never binds its model — passing one back would put two answers on the same prop
export type NavigationDrawerProps = Except<VNavigationDrawer["$props"], "modelValue" | "onUpdate:modelValue">;
