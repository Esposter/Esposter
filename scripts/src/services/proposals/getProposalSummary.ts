import type { ProposalSummary } from "#src/models/proposals/ProposalSummary";

import { ProposalSignal, ProposalSignals } from "#src/models/proposals/ProposalSignal";
import { getProposalRoute } from "#src/services/proposals/getProposalRoute";

const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n/u;
const SECTION_HEADING_REGEX = /^## /mu;
const KEY_FILES_HEADING_REGEX = /^Key files\s*$/iu;
const KEY_FILE_ROW_REGEX = /^\| `[^`]+`/gmu;
const PROPOSAL_LINK_REGEX = /\]\((?<route>\/docs\/proposals\/[^)#]+)/gu;
const MANIFEST_ROW_SUFFIX = "package.json`";
const ProposalSignalPathPrefixesMap = {
  [ProposalSignal.Azure]: ["apps/functions/", "apps/infra/"],
  [ProposalSignal.Schema]: ["packages/db-schema/"],
  [ProposalSignal.Server]: ["apps/web/server/"],
} as const satisfies Record<Exclude<ProposalSignal, ProposalSignal.Dependency>, readonly string[]>;
// A proposal's own folder indexes are its umbrella, never something it waits on
const getAncestorRoutes = (route: string): Set<string> => {
  const segments = route.split("/");
  return new Set(segments.map((_value, index) => segments.slice(0, index).join("/")));
};
// Everything is read off what the page already states, so nothing here is a field anyone keeps: the lead — the prose
// Before the first section — is where a proposal links the proposals it waits on, a Key files row is a table line
// Opening on a backticked path, and a package a proposal adds is the manifest it names there (`docs` skill,
// `references/page-shapes.md`)
export const getProposalSummary = (path: string, text: string, openRoutes: ReadonlySet<string>): ProposalSummary => {
  const body = text.replace(FRONTMATTER_REGEX, "");
  const route = getProposalRoute(path);
  const ancestorRoutes = getAncestorRoutes(route);
  const [lead = "", ...sections] = body.split(SECTION_HEADING_REGEX);
  const keyFilesSection = sections.find((section) => KEY_FILES_HEADING_REGEX.test(section.split("\n")[0] ?? ""));
  const keyFileRows = keyFilesSection?.match(KEY_FILE_ROW_REGEX) ?? [];
  const signals = ProposalSignals.filter((signal) =>
    signal === ProposalSignal.Dependency
      ? keyFileRows.some((row) => row.endsWith(MANIFEST_ROW_SUFFIX))
      : ProposalSignalPathPrefixesMap[signal].some((prefix) => keyFileRows.some((row) => row.includes(`\`${prefix}`))),
  );
  const linkedRoutes = new Set(Array.from(lead.matchAll(PROPOSAL_LINK_REGEX), ({ groups }) => groups?.route ?? ""));
  const blockerRoutes = [...linkedRoutes].filter(
    (linkedRoute) => openRoutes.has(linkedRoute) && linkedRoute !== route && !ancestorRoutes.has(linkedRoute),
  );
  return {
    blockerRoutes,
    hasKeyFiles: keyFilesSection !== undefined,
    keyFileCount: keyFileRows.length,
    path,
    route,
    signals,
  };
};
