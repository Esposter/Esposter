// Every `<path>:<line> → <text>` where a hand-written page matches the regex, the text being what its named group captured
export const getLineMatches = (files: { markdown: string; path: string }[], regex: RegExp, group: string): string[] =>
  files
    .flatMap(({ markdown, path }) =>
      markdown
        .split("\n")
        .flatMap((line, index) =>
          Array.from(line.matchAll(regex), (match) => `${path}:${index + 1} → ${match.groups?.[group] ?? ""}`),
        ),
    )
    .toSorted();
