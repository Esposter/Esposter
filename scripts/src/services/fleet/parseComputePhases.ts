import type { ComputePhase } from "#src/models/fleet/ComputePhase";

import { ComputeKind } from "#src/models/fleet/ComputeKind";
import { COMPUTE_QUEUE_PHASE_HEADING, MAX_GENSHIN_PHASE } from "#src/services/fleet/constants";
import { readMarkdownSection } from "#src/services/fleet/readMarkdownSection";
import { checkIsEnumValue } from "#src/services/shared/checkIsEnumValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A row's page link opens on its area's folder, and its kind and phase are the last two cells. A row whose phase is
// Not a whole number is not read as a row at all, so a header or a separator never is one
const ROW_REGEX =
  /^\|[^|\n]*\|\s*\[[^\]\n]*\]\((?<page>(?<folder>[^/)\n]+)\/[^)\n]*)\)\s*\|\s*(?<kind>[^|\n]*?)\s*\|\s*(?<phase>\d+)\s*\|$/gmu;

// The kind and phase each compute page's folder holds, from the index's Phases table. A row whose phase is past the last
// Genshin phase maps to nothing, so its page has no row and its read fails rather than taking a phase off the list. A
// Row whose kind is not a compute kind fails the read, naming its page
export const parseComputePhases = (index: string): Map<string, ComputePhase> => {
  const section = readMarkdownSection(index, COMPUTE_QUEUE_PHASE_HEADING);
  const rows = Array.from(section.matchAll(ROW_REGEX), ({ groups }) => ({
    folder: groups?.folder ?? "",
    kind: groups?.kind ?? "",
    page: groups?.page ?? "",
    phase: Number(groups?.phase),
  })).filter(({ phase }) => phase <= MAX_GENSHIN_PHASE);
  return new Map(
    rows.map(({ folder, kind, page, phase }) => {
      if (!checkIsEnumValue(ComputeKind, kind))
        throw new InvalidOperationError(
          Operation.Read,
          page,
          `its Kind is ${kind}, not one of ${Object.values(ComputeKind).join(", ")}`,
        );
      return [folder, { kind, phase }] as const;
    }),
  );
};
