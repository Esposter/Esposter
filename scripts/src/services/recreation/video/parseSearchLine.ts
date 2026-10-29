import type { SearchCandidate } from "#src/models/recreation/video/SearchCandidate";

import { searchResultSchema } from "#src/models/recreation/video/searchResultSchema";
import { toSearchCandidate } from "#src/services/recreation/video/toSearchCandidate";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";

export const parseSearchLine = (line: string): SearchCandidate | undefined =>
  getResult(() => parseMachineJson(line)).match(
    (json) => {
      const parsedResult = searchResultSchema.safeParse(json);
      return parsedResult.success ? toSearchCandidate(parsedResult.data) : undefined;
    },
    () => undefined,
  );
