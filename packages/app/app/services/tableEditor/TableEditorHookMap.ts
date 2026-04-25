import type { Promisable } from "type-fest";

export interface TableEditorHookMap {
  Close: (() => Promisable<void>)[];
}

export const TableEditorHookMap: TableEditorHookMap = {
  Close: [],
};
