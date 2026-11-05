import { COMPUTE_QUEUE_PHASE_HEADING, MAX_GENSHIN_PHASE } from "#src/services/fleet/constants";

// A Phases section runs to the next level-two heading, which ends it
const SECTION_END_REGEX = /^## /mu;
// A row's page link opens on its area's folder, and its phase is the last cell. A row whose phase is not a whole number
// Is not read as a row at all, so a header or a separator never is one
const ROW_REGEX = /^\|[^|\n]*\|\s*\[[^\]\n]*\]\((?<folder>[^/)\n]+)\/[^)\n]*\)\s*\|\s*(?<phase>\d+)\s*\|$/gmu;

// The phase each compute page's folder holds, from the index's Phases table. A row whose phase is past the last Genshin
// Phase maps to nothing, so its page has no row and its read fails rather than taking a phase off the list
export const parseComputePhases = (index: string): Map<string, number> => {
  const section = (index.split(COMPUTE_QUEUE_PHASE_HEADING)[1] ?? "").split(SECTION_END_REGEX)[0] ?? "";
  const rows = Array.from(section.matchAll(ROW_REGEX), ({ groups }) => ({
    folder: groups?.folder ?? "",
    phase: Number(groups?.phase),
  }));
  return new Map(
    rows.filter(({ phase }) => phase <= MAX_GENSHIN_PHASE).map(({ folder, phase }) => [folder, phase] as const),
  );
};
