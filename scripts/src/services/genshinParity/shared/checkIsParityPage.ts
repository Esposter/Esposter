import {
  PARITY_PAGE_MAX_BYTES,
  PARITY_PAGE_TITLE,
  PARITY_PROBE_TIMEOUT_MS,
} from "#src/services/genshinParity/shared/constants";
import { fetchOk } from "#src/services/shared/fetchOk";
import { getResultAsync } from "@esposter/shared";

// Whether the parity page answers at a root, told apart by its title from whatever else serves on the same port
export const checkIsParityPage = (root: string): Promise<boolean> =>
  getResultAsync(async () => {
    const bytes = await fetchOk(root, { maxBytes: PARITY_PAGE_MAX_BYTES, timeoutMs: PARITY_PROBE_TIMEOUT_MS });
    return new TextDecoder().decode(bytes).includes(PARITY_PAGE_TITLE);
  }).match(
    (isParity) => isParity,
    // A port that answers nothing, or answers as another server, is not the parity page
    () => false,
  );
