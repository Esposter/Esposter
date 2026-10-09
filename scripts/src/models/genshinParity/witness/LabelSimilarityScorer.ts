import type { LabelSimilarityInput } from "#src/models/genshinParity/witness/LabelSimilarityInput";
import type { LabelSimilarityResult } from "#src/models/genshinParity/witness/LabelSimilarityResult";

// Scores each label's similarity between two grey images: the parity page's GPU reduction, or the CPU reference in a test
export type LabelSimilarityScorer = (input: LabelSimilarityInput) => Promise<LabelSimilarityResult>;
