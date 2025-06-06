import type { DataTableHeader as BaseDataTableHeader } from "vuetify";

export interface DataTableHeader<T = object> extends BaseDataTableHeader<T> {
  isRichText?: true;
}
