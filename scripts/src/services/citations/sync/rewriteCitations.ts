import type { PathRename } from "#src/models/citations/PathRename";

import { APP_RELATIVE_PREFIXES } from "@esposter/configuration";

const APP_DIRECTORY = "apps/web/";
const CITATION_REGEX = /`(?<citation>[^`\s]+)`/gu;

const getAppRelative = (path: string): string | undefined => {
  if (!path.startsWith(APP_DIRECTORY)) return undefined;
  const relative = path.slice(APP_DIRECTORY.length);
  return APP_RELATIVE_PREFIXES.some((prefix) => relative.startsWith(prefix)) ? relative : undefined;
};

// A citation is the backticked path a reader greps (`skill-authoring`), and it names the moved prefix either
// In full or in the app-relative form the docs' Key Files tables use — so each rename is applied in both spellings,
// And a citation whose target left `apps/web` is rewritten to the full path since no short form reaches it.
export const rewriteCitations = (text: string, renames: PathRename[]): string => {
  const spellings = renames
    .flatMap(({ from, to }) => {
      const fromRelative = getAppRelative(from);
      return fromRelative === undefined
        ? [{ from, to }]
        : [
            { from, to },
            { from: fromRelative, to: getAppRelative(to) ?? to },
          ];
    })
    .toSorted((a, b) => b.from.length - a.from.length);

  return text.replaceAll(CITATION_REGEX, (match, citation: string) => {
    const spelling = spellings.find(({ from }) => citation === from || citation.startsWith(`${from}/`));
    return spelling ? `\`${spelling.to}${citation.slice(spelling.from.length)}\`` : match;
  });
};
