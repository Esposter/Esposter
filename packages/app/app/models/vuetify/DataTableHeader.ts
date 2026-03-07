import type { Except } from "type-fest";
import type { DataTableHeader as BaseDataTableHeader } from "vuetify";

export interface DataTableHeader<T = object> extends Except<BaseDataTableHeader<T>, "key"> {
  isRichText?: true;
  key: Extract<keyof T, string> | (string & {});
}
