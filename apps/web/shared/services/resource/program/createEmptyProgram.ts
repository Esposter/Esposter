import type { ProgramResource } from "#shared/models/resource/program/ProgramResource";

export const createEmptyProgram = (): ProgramResource => ({ emailId: "", keyColumn: "", surveyId: "" });
