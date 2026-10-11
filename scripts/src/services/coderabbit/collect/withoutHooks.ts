import { withFinalizer, withFinalizerAsync } from "@esposter/shared";

// The repository's hooks reformat what a commit holds, so a pick the collector replays lands as a different commit
// Than the one it picked: its patch id changes, and the port's `git cherry` reads it as still owed. A `--continue` that
// Settles a conflict can also leave the index differing from HEAD, which git then refuses the next pick over. So every
// Git process a replay or a port starts, and the sessions it hands a conflict to, run with the hooks off for its
// Length. `GIT_CONFIG_PARAMETERS` is read above the checkout's own config, and is a name the session's environment
// Filter keeps, where a `GIT_CONFIG_KEY_n` pair would be dropped as a secret and leave the count pointing at nothing.
const CONFIG_PARAMETERS_VARIABLE = "GIT_CONFIG_PARAMETERS";
const HOOKS_OFF_PARAMETER = "'core.hooksPath'='/dev/null'";

const setHooksOff = (): (() => void) => {
  const previous = process.env[CONFIG_PARAMETERS_VARIABLE];
  process.env[CONFIG_PARAMETERS_VARIABLE] =
    previous === undefined ? HOOKS_OFF_PARAMETER : `${previous} ${HOOKS_OFF_PARAMETER}`;
  return () => {
    if (previous === undefined) delete process.env[CONFIG_PARAMETERS_VARIABLE];
    else process.env[CONFIG_PARAMETERS_VARIABLE] = previous;
  };
};

export const withoutHooks = <T>(run: () => T): T => withFinalizer(run, setHooksOff());

export const withoutHooksAsync = <T>(run: () => Promise<T>): Promise<T> => withFinalizerAsync(run, setHooksOff());
