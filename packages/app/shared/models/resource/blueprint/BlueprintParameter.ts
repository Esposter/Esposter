import type { ToData } from "@esposter/shared";

import {
  MAX_BLUEPRINT_KEY_LENGTH,
  MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH,
} from "#shared/services/resource/blueprint/constants";
import { createNormalizedStringSchema, normalizeString } from "@esposter/shared";
import { z } from "zod";

// A deploy-time input: `key` names the `{{parameter:key}}` token, `title`/`description` label its form
// Field, `defaultValue` prefills it. All parameters are strings in v1; typed parameters extend this object
export interface BlueprintParameter {
  defaultValue: string;
  description: string;
  key: string;
  title: string;
}

export const blueprintParameterSchema = z.object({
  defaultValue: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
  description: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
  key: z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX_BLUEPRINT_KEY_LENGTH)),
  title: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
}) satisfies z.ZodType<ToData<BlueprintParameter>>;
