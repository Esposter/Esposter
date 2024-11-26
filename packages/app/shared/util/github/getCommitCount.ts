import { SITE_NAME } from "@/shared/services/esposter/constants";

export const getCommitCount = async () => {
  const { headers } = await fetch(`https://api.github.com/repos/${SITE_NAME}/${SITE_NAME}/commits?per_page=1&page=1`);
  return parseInt(headers.get("Link")?.match(/(\d+)(?!.*(\d+))/)?.[0] ?? "0");
};
