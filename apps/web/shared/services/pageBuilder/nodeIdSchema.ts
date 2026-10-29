import { NODE_ID_LENGTH, NODE_ID_REGEX } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

export const nodeIdSchema = z.string().length(NODE_ID_LENGTH).regex(NODE_ID_REGEX);
