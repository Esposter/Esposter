import { checkIsParityPage } from "#src/services/genshinParity/shared/checkIsParityPage";
import { PARITY_DEFAULT_PORT, PARITY_PORT_COUNT } from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The root of the parity page, found by probing up from the first port: the server takes the next port when one is
// Busy, So the page is asked for port by port rather than assumed to be on one. The first port is `GENSHIN_PARITY_PORT`
// When it Is set, read at the call so a caller's environment is the one searched
export const resolveParityPageRoot = async (
  /* oxlint-disable-next-line typescript/no-inferrable-types -- isolatedDeclarations demands the annotation
     this default would otherwise infer */
  firstPort: number = Number(process.env.GENSHIN_PARITY_PORT ?? PARITY_DEFAULT_PORT),
): Promise<string> => {
  for (let port = firstPort; port < firstPort + PARITY_PORT_COUNT; port++) {
    const root = `http://localhost:${port}/parity/`;
    /* oxlint-disable-next-line no-await-in-loop -- Stop at the first: the first port that answers is the page, so the
       ports after it are not probed */
    if (await checkIsParityPage(root)) return root;
  }
  throw new InvalidOperationError(
    Operation.Read,
    "parity page",
    `no server answers on ports ${firstPort} to ${firstPort + PARITY_PORT_COUNT - 1}; start one with pnpm -C packages/genshin-world parity`,
  );
};
