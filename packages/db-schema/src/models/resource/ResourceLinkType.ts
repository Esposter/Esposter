import { z } from "zod";

// What a linked resource is used as. Who uses it is the source row's own type, so a role never restates it: a
// Program holds a Survey link for the survey it issues tokens for and a Dataset link for its audience, and those
// Stay apart even when both name the same survey
export enum ResourceLinkType {
  Dataset = "Dataset",
  Email = "Email",
  Survey = "Survey",
}

export const resourceLinkTypeSchema = z.enum(ResourceLinkType) satisfies z.ZodType<ResourceLinkType>;
