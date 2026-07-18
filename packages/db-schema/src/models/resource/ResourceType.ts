import { z } from "zod";

export enum ResourceType {
  Dashboard = "Dashboard",
  Email = "Email",
  Flowchart = "Flowchart",
  Note = "Note",
  Program = "Program",
  Sheet = "Sheet",
  Survey = "Survey",
  TodoList = "TodoList",
  Webpage = "Webpage",
}

export const resourceTypeSchema = z.enum(ResourceType) satisfies z.ZodType<ResourceType>;

export const ResourceTypes = Object.values(ResourceType);
