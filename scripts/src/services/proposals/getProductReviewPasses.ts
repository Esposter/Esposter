import type { ProductReviewPass } from "#src/models/proposals/ProductReviewPass";

import { PRODUCT_REVIEW_SUBJECT_PREFIX } from "#src/services/proposals/constants";
import { getGitRecords } from "#src/services/shared/getGitRecords";

// A pass's subject names its areas before the dash — `docs(product-review): esbabbler, post — converged` — by the
// Folder names the proposals tree uses (`product-review` skill, `references/convergence.md`)
const AREA_SEPARATOR_REGEX = /,\s*|\s+and\s+/u;
// A log printed as `%at%x1F%as%x1F%s%x1E`; `--grep` matches anywhere in the message, so the subject is held here
export const getProductReviewPasses = (log: string): ProductReviewPass[] =>
  getGitRecords(log)
    .filter((fields) => fields.at(2)?.startsWith(PRODUCT_REVIEW_SUBJECT_PREFIX))
    .map(([timestamp = "", date = "", subject = ""]) => {
      const [areaList = ""] = subject.slice(PRODUCT_REVIEW_SUBJECT_PREFIX.length).split(" — ");
      return {
        areas: areaList.split(AREA_SEPARATOR_REGEX).map((area) => area.trim()),
        date,
        timestamp: Number(timestamp),
      };
    });
