import {
  PARITY_DEFAULT_PORT,
  PARITY_PAGE_TITLE,
  PARITY_PORT_COUNT,
  PARITY_PROBE_TIMEOUT_MS,
} from "#src/services/genshinParity/shared/constants";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";

// Whether the parity page answers at a root, told apart by its title from whatever else serves on the same port
const isParityPage = (root: string): Promise<boolean> =>
  getResultAsync(async () => {
    const response = await fetch(root, { signal: AbortSignal.timeout(PARITY_PROBE_TIMEOUT_MS) });
    return response.ok && (await response.text()).includes(PARITY_PAGE_TITLE);
  }).match(
    (isParity) => isParity,
    () => false,
  );

// The root of the parity page, found by probing up from the first port: the server takes the next port when one is busy,
// So the page is asked for port by port rather than assumed to be on one. The first port is `GENSHIN_PARITY_PORT` when it
// Is set, read at the call so a caller's environment is the one searched
export const resolveParityPageRoot = async (
  firstPort: number = Number(process.env.GENSHIN_PARITY_PORT ?? PARITY_DEFAULT_PORT),
): Promise<string> => {
  for (let port = firstPort; port < firstPort + PARITY_PORT_COUNT; port++) {
    const root = `http://localhost:${port}/parity/`;
    // oxlint-disable-next-line no-await-in-loop -- the first port that answers is the page, so each probe waits on the last
    if (await isParityPage(root)) return root;
  }
  throw new InvalidOperationError(
    Operation.Read,
    "parity page",
    `no server answers on ports ${firstPort} to ${firstPort + PARITY_PORT_COUNT - 1}; start one with pnpm -C packages/genshin-world parity`,
  );
};
