// The leading block only: a `description:` past it (a template inside the body) is prose
const FRONTMATTER_REGEX = /^---\n(?<frontmatter>[\s\S]*?)\n---/u;
const DESCRIPTION_REGEX = /^description:(?<description>.*)$/mu;

export const getFrontmatterDescription = (text: string): string =>
  (DESCRIPTION_REGEX.exec(FRONTMATTER_REGEX.exec(text)?.groups?.frontmatter ?? "")?.groups?.description ?? "").trim();
