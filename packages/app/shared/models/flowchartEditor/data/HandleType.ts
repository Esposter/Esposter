import type { HandleType } from "@vue-flow/core";

import { z } from "zod";

export const handleTypeSchema = z.literal(["source", "target"]) satisfies z.ZodType<HandleType>;
