import { delimiter } from "node:path";

const PACKAGE_BIN_REGEX = /[/\\]node_modules[/\\]\.bin(?:[/\\]|$)/u;
const PATH_KEY_REGEX = /^path$/iu;

// The environment with every `node_modules/.bin` folder taken off its path. `pnpm run` puts the workspace's own bins
// First, so a spawned `vp` would be the workspace's vite-plus CLI, which has no `env` command, rather than the global one
// That installs node. Windows names the variable `Path`, so the key is matched in any case
export const getEnvWithoutPackageBins = (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries<string | undefined>(env).map(([key, value]) => [
      key,
      PATH_KEY_REGEX.test(key) && value !== undefined
        ? value
            .split(delimiter)
            .filter((entry) => !PACKAGE_BIN_REGEX.test(entry))
            .join(delimiter)
        : value,
    ]),
  );
