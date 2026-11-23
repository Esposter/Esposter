const DIRECTIVES = ["oxlint-disable", "oxlint-enable", "oxlint-disable-line", "oxlint-disable-next-line"];
const JUSTIFICATION_REGEX = /\s-{2,}\s/u;

// The directive a comment's text carries and the rules it names, ignoring the justification after ` -- `
export const parseOxlintDirective = (comment: string): { directive: string; rules: "all" | string[] } | undefined => {
  if (!comment.includes("oxlint-")) return undefined;
  const justification = JUSTIFICATION_REGEX.exec(comment);
  const directivePart = (justification ? comment.slice(0, justification.index) : comment).trim();
  const directive = DIRECTIVES.find(
    (candidate) => directivePart === candidate || directivePart.startsWith(`${candidate} `),
  );
  if (directive === undefined) return undefined;
  if (directivePart === directive) return { directive, rules: "all" };
  return {
    directive,
    rules: directivePart
      .slice(directive.length + 1)
      .split(",")
      .map((rule) => rule.trim())
      .filter((rule) => rule.length > 0),
  };
};
