// Whether a survey has a published version, as a lookup answers it: a lookup that fails answers Unreadable, never Unpublished
export const SurveyPublishState = {
  Published: "Published",
  Unpublished: "Unpublished",
  Unreadable: "Unreadable",
} as const;
export type SurveyPublishState = (typeof SurveyPublishState)[keyof typeof SurveyPublishState];
