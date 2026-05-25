import type { Promisable } from "type-fest";

interface TableEditorHookMap {
  Close: (() => Promisable<void>)[];
}

export const TableEditorHookMap: TableEditorHookMap = {
  Close: [],
};
