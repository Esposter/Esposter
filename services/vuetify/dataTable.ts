import { ArrayElement } from "type-fest/source/internal";
import { VDataTable } from "vuetify/labs/VDataTable";

export type DataTableHeader = ArrayElement<ArrayElement<InstanceType<typeof VDataTable>["$props"]["headers"]>>;
