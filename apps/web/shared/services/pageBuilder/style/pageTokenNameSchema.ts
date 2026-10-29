import { MAX_PAGE_TOKEN_NAME_LENGTH, PAGE_TOKEN_NAME_REGEX } from "#shared/services/pageBuilder/style/constants";
import { z } from "zod";

// A token's name is a custom property's suffix, so it is an identifier and never needs escaping
export const pageTokenNameSchema = z.string().max(MAX_PAGE_TOKEN_NAME_LENGTH).regex(PAGE_TOKEN_NAME_REGEX);
