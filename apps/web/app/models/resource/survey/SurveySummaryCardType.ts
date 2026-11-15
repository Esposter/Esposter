// How a question's answers are summarised: counted per choice, read as numbers, or listed as they were written
export const SurveySummaryCardType = { Choice: "Choice", Number: "Number", Text: "Text" } as const;
export type SurveySummaryCardType = (typeof SurveySummaryCardType)[keyof typeof SurveySummaryCardType];
