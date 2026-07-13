import { z } from "zod";

export enum ResourceStatusFilter {
  Draft = "Draft",
  Published = "Published",
}

export const resourceStatusFilterSchema = z.enum(ResourceStatusFilter) satisfies z.ZodType<ResourceStatusFilter>;
