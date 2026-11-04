import type { SurveyListEditorOptions } from "@/models/resource/survey/SurveyListEditorOptions";
import type { z } from "zod";

// What a choice list's editor checks each row by: a choice needs a value, a value is unique within its list, and the
// Schema the choices are parsed by refuses everything else that makes one invalid
export const getSurveyChoiceListEditorOptions = <T extends { value: number | string }>(
  schema: z.ZodType<T>,
): SurveyListEditorOptions<T> => ({
  duplicateMessage: "Choice values must be unique",
  getItemError: (choice) =>
    String(choice.value) === "" ? "A choice needs a value" : schema.safeParse(choice).error?.issues[0]?.message,
  getKey: (choice) => String(choice.value),
});
