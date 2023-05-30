import type { ArrayElement } from "type-fest/source/internal";
import type { VDataTable } from "vuetify/labs/VDataTable";

export type DataTableHeader = ArrayElement<ArrayElement<VDataTable["$props"]["headers"]>>;
