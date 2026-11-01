import type { z } from "zod";

import { formatLeafIssue } from "#src/services/formatLeafIssue";
import { getLeafIssues } from "#src/services/getLeafIssues";

export const formatZodIssues = (issues: z.core.$ZodIssue[]): string =>
  issues
    .flatMap((issue) => getLeafIssues(issue, []))
    .map((leafIssue) => formatLeafIssue(leafIssue))
    .join("; ");
