import { MAX_SURVEY_NODE_COUNT } from "#src/services/constants";
import { z } from "zod";

// A node's children are bounded by the most nodes a survey may hold, so no slot can hold more than a document can
export const boundedChildren = <TSchema extends z.ZodType>(schema: TSchema): z.ZodArray<TSchema> =>
  z.array(schema).max(MAX_SURVEY_NODE_COUNT);
