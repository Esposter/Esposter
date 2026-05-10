import { z } from "zod";

export enum TableEditorType {
  File = "File",
  TodoList = "TodoList",
  VuetifyComponent = "VuetifyComponent",
}

export const tableEditorTypeSchema = z.enum(TableEditorType) satisfies z.ZodType<TableEditorType>;

export const TableEditorTypes: ReadonlySet<TableEditorType> = new Set(Object.values(TableEditorType));
