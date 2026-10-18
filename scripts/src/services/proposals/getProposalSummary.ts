import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { ProposalSignal, ProposalSignals } from "#src/models/proposals/ProposalSignal";
import { PROGRAM_SUFFIX } from "#src/services/proposals/constants";

const SECTION_HEADING_REGEX = /^## /mu;
const KEY_FILES_HEADING_REGEX = /^Key files\s*$/iu;
const KEY_FILE_ROW_REGEX = /^\| `[^`]+`/gmu;
// A sibling change's design, or its folder: `](../<id>/design.md)` or `](../<id>/)`
const PROPOSAL_LINK_REGEX = /\]\(\.\.\/(?<id>[\w-]+)\/(?:design\.md)?(?:#[^)]*)?\)/gu;
const MANIFEST_ROW_SUFFIX = "package.json`";
const ProposalSignalPathPrefixesMap = {
  [ProposalSignal.Azure]: ["apps/functions/", "apps/infra/"],
  [ProposalSignal.Schema]: ["packages/db-schema/"],
  [ProposalSignal.Server]: ["apps/web/server/"],
} as const satisfies Record<Exclude<ProposalSignal, ProposalSignal.Dependency>, readonly string[]>;
// A change's own program is its umbrella, never something it waits on
const checkIsProgramOf = (linkedId: string, id: string): boolean =>
  linkedId.endsWith(PROGRAM_SUFFIX) && id.startsWith(`${linkedId.slice(0, -PROGRAM_SUFFIX.length)}-`);
// Everything is read off what the design already states, so nothing here is a field anyone keeps: the lead — the prose
// Before the first section — is where a proposal links the proposals it waits on, a Key files row is a table line
// Opening on a backticked path, and a package a proposal adds is the manifest it names there (`openspec` skill)
export const getProposalSummary = (id: string, text: string, openIds: ReadonlySet<string>): ProposalSummary => {
  const [lead = "", ...sections] = text.split(SECTION_HEADING_REGEX);
  const keyFilesSection = sections.find((section) => KEY_FILES_HEADING_REGEX.test(section.split("\n")[0] ?? ""));
  const keyFileRows = keyFilesSection?.match(KEY_FILE_ROW_REGEX) ?? [];
  const signals = ProposalSignals.filter((signal) =>
    signal === ProposalSignal.Dependency
      ? keyFileRows.some((row) => row.endsWith(MANIFEST_ROW_SUFFIX))
      : ProposalSignalPathPrefixesMap[signal].some((prefix) => keyFileRows.some((row) => row.includes(`\`${prefix}`))),
  );
  const linkedIds = new Set(Array.from(lead.matchAll(PROPOSAL_LINK_REGEX), ({ groups }) => groups?.id ?? ""));
  const blockerIds = [...linkedIds].filter(
    (linkedId) => openIds.has(linkedId) && linkedId !== id && !checkIsProgramOf(linkedId, id),
  );
  return { blockerIds, hasKeyFiles: keyFilesSection !== undefined, id, keyFileCount: keyFileRows.length, signals };
};
