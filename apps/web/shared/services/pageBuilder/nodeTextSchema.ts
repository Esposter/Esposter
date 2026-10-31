import { MAX_NODE_TEXT_LENGTH } from "#shared/services/pageBuilder/constants";
import { z } from "zod";

// The visible text a node carries: a label, a title, a tooltip's text or one line of a typed text
export const nodeTextSchema = z.string().min(1).max(MAX_NODE_TEXT_LENGTH);
