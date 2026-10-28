import type { ParityServer } from "#src/models/genshinParity/load/ParityServer";

import { getFreePort } from "#src/services/genshinParity/load/getFreePort";
import { getParityServerArgs } from "#src/services/genshinParity/load/getParityServerArgs";
import {
  ANSI_ESCAPE_REGEX,
  GENSHIN_WORLD_DIRECTORY,
  PARITY_PREVIEW_TIMEOUT_MS,
} from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";

// Serves the parity page on a free port with Vite, its dev server or its preview of the production build, and resolves
// Once it announces that address. The caller stops it with `stop` when it is done, success or not
export const startParityServer = async (isDev: boolean): Promise<ParityServer> => {
  const port = await getFreePort();
  const origin = `http://localhost:${port}`;
  const server = spawn(process.execPath, getParityServerArgs(isDev, port), {
    cwd: GENSHIN_WORLD_DIRECTORY,
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise<void>((resolve, reject) => {
    const fail = (error: InvalidOperationError) => {
      clearTimeout(timeout);
      server.kill();
      reject(error);
    };
    const timeout = setTimeout(() => {
      fail(new InvalidOperationError(Operation.Create, origin, "its server did not announce its address in time"));
    }, PARITY_PREVIEW_TIMEOUT_MS);
    let output = "";
    const onData = (chunk: Buffer) => {
      // The address can be split across chunks, so it is looked for in all the output so far. Vite colours it, its port
      // Between escape codes, so they are stripped before it is looked for
      output += chunk.toString();
      if (!output.replaceAll(ANSI_ESCAPE_REGEX, "").includes(origin)) return;
      clearTimeout(timeout);
      // Once found, the output is no longer kept, so the server's later output does not grow the process's memory
      server.stdout.off("data", onData);
      resolve();
    };
    server.stdout.on("data", onData);
    server.once("exit", (code) => {
      fail(new InvalidOperationError(Operation.Create, origin, `its server exited with ${code}`));
    });
  });
  return {
    origin,
    stop: () => {
      server.kill();
    },
  };
};
