import { readAnimeStudioExceptions } from "#src/services/genshinAssets/shared/readAnimeStudioExceptions";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The verdict on one AnimeStudio run: a non-zero exit fails it, with the failure's own text, and so does a clean exit
// Whose output names an exception, since AnimeStudio skips what threw and carries on
export const judgeAnimeStudioRun = (
  status: null | number,
  output: string,
  failure: string,
): InvalidOperationError | undefined => {
  const exceptions = readAnimeStudioExceptions(output);
  if (status === 0 && exceptions.length === 0) return undefined;
  if (status === 0)
    return new InvalidOperationError(
      Operation.Read,
      "AnimeStudio",
      `exited 0 but threw ${exceptions.length} exception(s), skipping what threw:\n${exceptions.slice(0, 5).join("\n")}`,
    );
  return new InvalidOperationError(Operation.Create, "AnimeStudio", failure);
};
