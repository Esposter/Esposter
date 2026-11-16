import type { BaseSurveySummaryCard } from "#src/models/resource/survey/BaseSurveySummaryCard";
import type { SurveySummaryCardType } from "#src/models/resource/survey/SurveySummaryCardType";

// One question of the summary. A choice's count is out of the responses that answered, so a question taking several
// Choices can pass 100% across them; a rating is a choice question with an average
export type SurveySummaryCard = BaseSurveySummaryCard &
  (
    | { answers: string[]; type: typeof SurveySummaryCardType.Text }
    | { average: number; maximum: number; minimum: number; type: typeof SurveySummaryCardType.Number }
    | {
        average?: number | undefined;
        choices: { count: number; label: string }[];
        type: typeof SurveySummaryCardType.Choice;
      }
  );
