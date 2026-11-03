import type { SurveyEditDraft } from "@/models/resource/survey/SurveyEditDraft";

// A draft shows only while the saved text it was typed over is still saved, so an undo or a write elsewhere shows the
// Saved text rather than a draft of a value that is gone
export const getActiveSurveyEditDraft = (
  draft: SurveyEditDraft | undefined,
  savedText: string,
): SurveyEditDraft | undefined => (draft?.base === savedText ? draft : undefined);
