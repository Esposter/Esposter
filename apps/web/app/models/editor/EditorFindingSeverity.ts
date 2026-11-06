import { UiToken } from "@/models/ui/UiToken";

// How serious a finding is. An error refuses a save and a warning informs without refusing one. The values are the tokens
// the surface draws each in, so UiStatusIconMeaningMap marks a finding with no map of its own
export const EditorFindingSeverity = { Error: UiToken.Error, Warning: UiToken.Warning } as const;
export type EditorFindingSeverity = (typeof EditorFindingSeverity)[keyof typeof EditorFindingSeverity];
