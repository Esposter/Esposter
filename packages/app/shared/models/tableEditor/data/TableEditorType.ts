import { z } from "zod";

export enum TableEditorType {
  File = "File",
  TodoList = "TodoList",
  VuetifyComponent = "VuetifyComponent",
}

export const tableEditorTypeSchema = z.enum(TableEditorType);
