export const SurveyAchievementName = {
  DataCollector: "DataCollector",
  Modeler: "Modeler",
  Publisher: "Publisher",
  Respondent: "Respondent",
  ResponseEditor: "ResponseEditor",
  SurveyDeleter: "SurveyDeleter",
  SurveyEditor: "SurveyEditor",
  SurveyGuru: "SurveyGuru",
  Surveyor: "Surveyor",
  SurveySays: "SurveySays",
} as const;
export type SurveyAchievementName = (typeof SurveyAchievementName)[keyof typeof SurveyAchievementName];
