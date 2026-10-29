import { getTextExtensions } from "#shared/services/pageBuilder/text/getTextExtensions";
import { getSchema } from "@tiptap/core";

export const TEXT_SCHEMA = getSchema(getTextExtensions());
