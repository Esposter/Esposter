import type { ResumeItem } from "#src/models/resume/ResumeItem";
import type { ResumeRow } from "#src/models/resume/ResumeRow";

import { getResultAsync } from "@esposter/shared";

// A check that cannot run reports its error on its own row and leaves the others alone
export const readResumeRow = async (
  name: string,
  read: () => Promise<ResumeItem[]> | ResumeItem[],
): Promise<ResumeRow> =>
  (
    await getResultAsync(async () => {
      const items = await read();
      return items;
    })
  ).match(
    (items) => ({ error: "", items, name }),
    (error) => ({ error: error.message.split("\n")[0] ?? "", items: [], name }),
  );
