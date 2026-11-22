import type { HandWrittenPage } from "#src/models/workspace/HandWrittenPage";

// Every `<path>:<line> → <text>` where a hand-written page matches the regex, the text being its named group's capture
export const getLineMatches = (files: HandWrittenPage[], regex: RegExp, group: string): string[] =>
  files
    .flatMap(({ markdown, path }) =>
      markdown
        .split("\n")
        .flatMap((line, index) =>
          Array.from(line.matchAll(regex), (match) => `${path}:${index + 1} → ${match.groups?.[group] ?? ""}`),
        ),
    )
    .toSorted();
