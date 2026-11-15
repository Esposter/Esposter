import { z } from "zod";

export const ResourceType = {
  Blueprint: "Blueprint",
  Dashboard: "Dashboard",
  Email: "Email",
  Note: "Note",
  Program: "Program",
  Sheet: "Sheet",
  Survey: "Survey",
  TodoList: "TodoList",
  Webpage: "Webpage",
  Whiteboard: "Whiteboard",
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const resourceTypeSchema = z.enum(ResourceType) satisfies z.ZodType<ResourceType>;

export const ResourceTypes: readonly ResourceType[] = Object.values(ResourceType);
