import { escapeHtml } from "#shared/util/text/escapeHtml";

const getRepositoryPathPattern = (files: readonly string[]) =>
  new RegExp(
    `(?<![\\w./-])(${files
      .toSorted((left, right) => right.length - left.length)
      .map((file) => RegExp.escape(file))
      .join("|")})(?![\\w./-])`,
    "gu",
  );

export const createRepositoryPathLinkifier = (files: readonly string[]) => {
  const pattern = getRepositoryPathPattern(files);
  return {
    linkifyCode: (source: string) => {
      if (files.length === 0) return escapeHtml(source);
      let result = "";
      let lastIndex = 0;
      for (const match of source.matchAll(pattern)) {
        const matchIndex = match.index;
        if (matchIndex === undefined) continue;
        const path = match[0];
        result += `${escapeHtml(source.slice(lastIndex, matchIndex))}<a href="#agent-console-file">${escapeHtml(path)}</a>`;
        lastIndex = matchIndex + path.length;
      }
      return `${result}${escapeHtml(source.slice(lastIndex))}`;
    },
    linkifyHtml: (html: string) => {
      if (files.length === 0) return html;
      let isLink = false;
      return html.replaceAll(/<[^>]+>|[^<]+/gu, (token) => {
        if (/^<a\b/iu.test(token)) isLink = true;
        else if (/^<\/a>/iu.test(token)) isLink = false;
        return token.startsWith("<") || isLink
          ? token
          : token.replace(pattern, (path) => `<a href="#agent-console-file">${path}</a>`);
      });
    },
  };
};
