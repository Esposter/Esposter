import type { ArrayElement } from "type-fest/source/internal";
import type { VDataTable } from "vuetify/labs/VDataTable";

// @TODO: Remove this type when vuetify team exposes it
// https://github.com/vuetifyjs/vuetify/issues/16680
export type DataTableHeader = ArrayElement<ArrayElement<VDataTable["$props"]["headers"]>>;
