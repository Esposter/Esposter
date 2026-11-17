import type { ToData } from "@esposter/shared";

import {
  MAX_BLUEPRINT_KEY_LENGTH,
  MAX_BLUEPRINT_PARAMETER_CHOICES,
  MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH,
} from "#shared/services/resource/blueprint/constants";
import { createNameSchema } from "@esposter/db-schema";
import { createNormalizedStringSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A deploy-time input: `key` names the `{{parameter:key}}` token, `title`/`description` label its form
// Field, `defaultValue` prefills it. All parameters are strings in v1; typed parameters extend this object.
// A parameter with `allowedValues` is a choice: its form offers those values and deploy takes no other
export interface BlueprintParameter {
  allowedValues?: string[] | undefined;
  defaultValue: string;
  description: string;
  key: string;
  title: string;
}

export const blueprintParameterSchema = z
  .object({
    allowedValues: createUniqueArraySchema(
      createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH, z.string().min(1)),
    )
      .min(1)
      .max(MAX_BLUEPRINT_PARAMETER_CHOICES)
      .optional(),
    defaultValue: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
    description: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
    key: createNameSchema(MAX_BLUEPRINT_KEY_LENGTH),
    title: createNormalizedStringSchema(MAX_BLUEPRINT_PARAMETER_TEXT_LENGTH).default(""),
  })
  .refine(({ allowedValues, defaultValue }) => allowedValues === undefined || allowedValues.includes(defaultValue), {
    error: "A default must be one of the allowed values",
    path: ["defaultValue"],
  }) satisfies z.ZodType<ToData<BlueprintParameter>>;
