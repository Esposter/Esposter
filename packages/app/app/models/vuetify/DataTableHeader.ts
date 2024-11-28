import type { ArrayElement } from "type-fest/source/internal";
import type { VDataTable } from "vuetify/components/VDataTable";

// @TODO: Internal vuetify types
// https://github.com/vuetifyjs/vuetify/issues/16680
export type DataTableHeader = ArrayElement<VDataTable["$props"]["headers"]> & { isRichText?: true };
