import type { AnsweredCommit } from "#src/models/coderabbit/collect/AnsweredCommit";
import type { DrainInput } from "#src/models/coderabbit/collect/DrainInput";
import type { DrainVerdicts } from "#src/models/coderabbit/collect/DrainVerdicts";

export interface UnansweredFindingsInput extends DrainVerdicts, Pick<DrainInput, "openThreads" | "reviewId"> {
  // The commits the drain made, whose trailers name what they fixed
  commits: AnsweredCommit[];
}
