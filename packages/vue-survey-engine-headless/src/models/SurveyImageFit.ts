// How a picture fills the box it is drawn in, the four fits a browser's object-fit takes
export const SurveyImageFit = { Contain: "contain", Cover: "cover", Fill: "fill", None: "none" } as const;
export type SurveyImageFit = (typeof SurveyImageFit)[keyof typeof SurveyImageFit];
