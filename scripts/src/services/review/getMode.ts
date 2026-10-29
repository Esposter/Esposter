import { ReviewMode } from "#src/models/review/ReviewMode";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getMode = (from: string, to: string): ReviewMode => {
  if (from === "" && to === "") return ReviewMode.Steady;
  if (from === "" || to === "")
    throw new InvalidOperationError(Operation.Read, "review range", "it takes both --from and --to");
  return ReviewMode.Range;
};
