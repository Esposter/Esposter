import type { ArrayElement } from "type-fest/source/internal";
import type { VTabs } from "vuetify/components/VTabs";

// @TODO: Internal vuetify types
// https://github.com/vuetifyjs/vuetify/issues/16680
export type TabItem = ArrayElement<VTabs["$props"]["items"]>;
