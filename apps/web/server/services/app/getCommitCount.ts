import { SITE_NAME } from "@esposter/shared";

export const getCommitCount = async () => {
  const { headers } = await fetch(`https://api.github.com/repos/${SITE_NAME}/${SITE_NAME}/commits?per_page=1&page=1`);
  // The last number in the Link header is the last page, which at one commit per page is the commit count
  return Number(headers.get("Link")?.match(/(?<count>\d+)(?!.*\d)/u)?.groups?.count ?? "0");
};
