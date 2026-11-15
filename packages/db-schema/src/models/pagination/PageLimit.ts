import { DEFAULT_PAGE_LIMIT } from "#src/services/pagination/constants";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { z } from "zod";

// How many items one page holds, at most the read cap
export const pageLimitSchema = z.int().min(1).max(MAX_READ_LIMIT).default(DEFAULT_PAGE_LIMIT);
