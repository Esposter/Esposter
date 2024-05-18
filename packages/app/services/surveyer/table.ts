export const getPublishedSurveyRowKey = (surveyRowKey: string, surveyPublishVersion: number) =>
  `${surveyRowKey}-${surveyPublishVersion}`;
