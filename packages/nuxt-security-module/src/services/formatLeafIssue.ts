import type { LeafIssue } from "#src/models/LeafIssue";

export const formatLeafIssue = ({ issue, path }: LeafIssue): string => {
  const dottedPath = path.map(String).join(".");
  return `${dottedPath || "(options)"}: ${issue.message}`;
};
