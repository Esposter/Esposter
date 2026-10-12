import {
  ANSI_ESCAPE_REGEX,
  GENSHIN_WORLD_DIRECTORY,
  PARITY_BUILD_DIRECTORY_NAME,
  PARITY_CONFIG_PATH,
  PARITY_PREVIEW_TIMEOUT_MS,
  VITE_BIN_PATH,
} from "#src/services/genshinParity/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

export interface ParityPreview {
  origin: string;
  stop: () => void;
}

// A port nothing listens on at the moment of asking, which the preview server then takes
const getFreePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === "object" && address) resolve(address.port);
        else reject(new InvalidOperationError(Operation.Create, "a port", "none was given"));
      });
    });
  });

// Serves the production build on a free port with Vite's preview server, and resolves once it announces that address. The
// Caller stops it with `stop` when it is done, success or not
export const startParityPreview = async (): Promise<ParityPreview> => {
  const port = await getFreePort();
  const origin = `http://localhost:${port}`;
  const preview = spawn(
    process.execPath,
    [
      VITE_BIN_PATH,
      "preview",
      "--config",
      PARITY_CONFIG_PATH,
      "--outDir",
      PARITY_BUILD_DIRECTORY_NAME,
      "--port",
      String(port),
      "--strictPort",
    ],
    { cwd: GENSHIN_WORLD_DIRECTORY, stdio: ["ignore", "pipe", "inherit"] },
  );
  await new Promise<void>((resolve, reject) => {
    const fail = (error: InvalidOperationError) => {
      clearTimeout(timeout);
      preview.kill();
      reject(error);
    };
    const timeout = setTimeout(() => {
      fail(new InvalidOperationError(Operation.Create, origin, "its preview did not announce its address in time"));
    }, PARITY_PREVIEW_TIMEOUT_MS);
    let output = "";
    const onData = (chunk: Buffer) => {
      // The address can be split across chunks, so it is looked for in all the output so far. Vite colours it, its port
      // Between escape codes, so they are stripped before it is looked for
      output += chunk.toString();
      if (!output.replaceAll(ANSI_ESCAPE_REGEX, "").includes(origin)) return;
      clearTimeout(timeout);
      // Once found, the output is no longer kept, so the preview's later output does not grow the process's memory
      preview.stdout.off("data", onData);
      resolve();
    };
    preview.stdout.on("data", onData);
    preview.once("exit", (code) => {
      fail(new InvalidOperationError(Operation.Create, origin, `its preview exited with ${code}`));
    });
  });
  return { origin, stop: () => preview.kill() };
};
