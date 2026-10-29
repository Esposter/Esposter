import { MAX_PAGE_TEXT_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

export const pageTextSchema = z.string().max(MAX_PAGE_TEXT_LENGTH);
