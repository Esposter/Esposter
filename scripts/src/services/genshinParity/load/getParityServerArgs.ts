import {
  PARITY_BUILD_DIRECTORY_NAME,
  PARITY_CONFIG_PATH,
  VITE_BIN_PATH,
} from "#src/services/genshinParity/shared/constants";

// The arguments Vite runs the parity page with on a port: its dev server, or its preview of the production build. A forced
// Dev server bundles its dependencies again, rather than reusing the ones it bundled when it started
export const getParityServerArgs = (isDev: boolean, port: number, isForced?: boolean): string[] => {
  const portArgs = ["--config", PARITY_CONFIG_PATH, "--port", String(port), "--strictPort"];
  return isDev
    ? [VITE_BIN_PATH, ...portArgs, ...(isForced === true ? ["--force"] : [])]
    : [VITE_BIN_PATH, "preview", ...portArgs, "--outDir", PARITY_BUILD_DIRECTORY_NAME];
};
