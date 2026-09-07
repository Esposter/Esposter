import type { Description } from "#shared/models/entity/Description";

import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export interface SlashCommandParameter extends Description {
  isRequired: boolean;
  name: string;
}

export const slashCommandParameterValueSchema = z.string().transform(normalizeString).pipe(z.string().min(1));
