import type { DatasetReference } from "#shared/models/dataset/DatasetReference";
import type { ToData } from "@esposter/shared";

import { datasetReferenceSchema } from "#shared/models/dataset/DatasetReference";
import { MAX_KEY_COLUMN_LENGTH } from "#shared/services/resource/program/constants";
import { createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

// Bare ids like every cross-resource link — re-resolved on read so a deleted binding fails soft
// Rather than stranding the program on a dangling foreign key
export interface ProgramResource {
  audience: DatasetReference | null;
  emailId: string;
  keyColumn: string;
  surveyId: string;
}

export const programResourceSchema = z.object({
  audience: datasetReferenceSchema.nullable().default(null),
  emailId: z.union([z.literal(""), z.uuid()]).default(""),
  // Names the audience column identifying a recipient — display and dedupe key, owner-side only
  keyColumn: createNormalizedStringSchema(MAX_KEY_COLUMN_LENGTH).default(""),
  surveyId: z.union([z.literal(""), z.uuid()]).default(""),
}) satisfies z.ZodType<ToData<ProgramResource>>;
