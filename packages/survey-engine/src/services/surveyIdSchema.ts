import { MAX_SURVEY_ID_LENGTH } from "#src/services/constants";
import { z } from "zod";

// The characters a node's id may hold, the ones an HTML id takes, so an id cannot close the attribute it is written into
const SURVEY_ID_REGEX = /^[\w-]+$/u;

// A node's id, bounded and restricted to the characters an HTML id takes, wherever a node holds one
export const surveyIdSchema: z.ZodString = z.string().max(MAX_SURVEY_ID_LENGTH).regex(SURVEY_ID_REGEX);
