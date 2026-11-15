import { PAGE_CURSOR_MAX_LENGTH } from "#src/services/pagination/constants";
import { z } from "zod";

// The cursor as it travels, before it is decoded for the sort it continues; the first page sends none
export const encodedPageCursorSchema = z.string().max(PAGE_CURSOR_MAX_LENGTH).default("");
