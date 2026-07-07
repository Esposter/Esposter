import { z } from "zod";

export enum ResourceType {
  Dashboard = "Dashboard",
  Email = "Email",
  File = "File",
  Flowchart = "Flowchart",
  Survey = "Survey",
  // Transitional: carries the multi-item table editor blob until the File/TodoList split lands (platform roadmap Phase 4)
  Table = "Table",
  TodoList = "TodoList",
  Webpage = "Webpage",
}

export const resourceTypeSchema = z.enum(ResourceType) satisfies z.ZodType<ResourceType>;

export const ResourceTypes = Object.values(ResourceType);
