// A text that spells a boolean in any case reads as that boolean
export const checkIsSurveyLogicBooleanText = (text: string): boolean => ["true", "false"].includes(text.toLowerCase());
