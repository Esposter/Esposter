import type { SurveySummaryCardType } from "@/models/resource/survey/SurveySummaryCardType";

interface BaseSurveySummaryCard {
  // How many responses answered the question, so a skipped optional question reads honestly
  answeredCount: number;
  name: string;
  title: string;
}
// One question of the summary. A choice's count is out of the responses that answered, so a question taking several
// Choices can pass 100% across them; a rating is a choice question with an average
export type SurveySummaryCard = BaseSurveySummaryCard &
  (
    | { answers: string[]; type: SurveySummaryCardType.Text }
    | { average: number; maximum: number; minimum: number; type: SurveySummaryCardType.Number }
    | { average?: number; choices: { count: number; label: string }[]; type: SurveySummaryCardType.Choice }
  );
