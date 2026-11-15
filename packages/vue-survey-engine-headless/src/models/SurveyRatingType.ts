// How a rating question draws its scale, so the owner picks one drawing and the runner never guesses at one
export const SurveyRatingType = { Labels: "labels", Smileys: "smileys", Stars: "stars" } as const;
export type SurveyRatingType = (typeof SurveyRatingType)[keyof typeof SurveyRatingType];
