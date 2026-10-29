import { MAX_PAGE_LANG_LENGTH, PAGE_LANG_REGEX } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// A BCP 47 language tag, as the root's lang attribute takes it
export const pageLangSchema = z.string().max(MAX_PAGE_LANG_LENGTH).regex(PAGE_LANG_REGEX);
