import { z } from "zod";

export enum DocumentType {
  Dashboard = "Dashboard",
  Email = "Email",
  Flowchart = "Flowchart",
  Table = "Table",
  Webpage = "Webpage",
}

export const documentTypeSchema = z.enum(DocumentType) satisfies z.ZodType<DocumentType>;
