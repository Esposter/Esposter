// Whether a survey has a published version, as a lookup answers it: a lookup that fails answers Unreadable, never Unpublished
export enum SurveyPublishState {
  Published = "Published",
  Unpublished = "Unpublished",
  Unreadable = "Unreadable",
}
