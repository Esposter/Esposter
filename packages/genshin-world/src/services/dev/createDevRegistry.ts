import type { DevCommand } from "#src/models/dev/DevCommand";
import type { DevHandle } from "#src/models/dev/DevHandle";
import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { DevResult } from "#src/models/dev/DevResult";
import type { DevScenario } from "#src/models/dev/DevScenario";
import type { DevVariable } from "#src/models/dev/DevVariable";

import { formatDevUsage } from "#src/services/dev/formatDevUsage";
import { runDevCommand } from "#src/services/dev/runDevCommand";
import { runDevScenario } from "#src/services/dev/runDevScenario";
import { setDevVariable } from "#src/services/dev/setDevVariable";
import { splitDevLine } from "#src/services/dev/splitDevLine";

// The table an owner's handles are registered into. A disposed command moves to the unmounted table rather than leaving,
// So a line naming it says the command is not available here instead of that it is unknown
export const createDevRegistry = (): DevRegistry => {
  const commands = new Map<string, DevCommand>();
  const unmountedCommands = new Map<string, DevCommand>();
  const scenarios = new Map<string, DevScenario>();
  const variables = new Map<string, DevVariable>();
  const listeners = new Set<() => void>();
  let renderers: NonNullable<DevHandle["renderer"]>[] = [];
  const SET_USAGE = "set <name> <value>";

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const setVariable = (words: readonly string[]): DevResult => {
    const variableName = words.slice(0, -1).join(" ");
    const variable = variables.get(variableName);
    if (!variable) return { error: `unknown variable ${variableName}`, ok: false, usage: SET_USAGE };

    const outcome = setDevVariable(variable, words.at(-1) ?? "");
    return outcome.ok ? outcome : { ...outcome, usage: SET_USAGE };
  };

  const runLine = (line: string): DevResult => {
    const [name, ...words] = splitDevLine(line);
    if (name === undefined) return { error: "empty line", ok: false, usage: "" };
    if (name === "set") return setVariable(words);

    const command = commands.get(name);
    if (command) return runDevCommand(command, words);

    const unmountedCommand = unmountedCommands.get(name);
    if (unmountedCommand) return { error: "not available here", ok: false, usage: formatDevUsage(unmountedCommand) };

    const suggestions = Array.from(commands.keys()).filter((commandName) => commandName.includes(name));
    if (suggestions.length === 0) return { error: `unknown command ${name}`, ok: false, usage: "" };

    return { error: `unknown command ${name}; did you mean ${suggestions.join(", ")}?`, ok: false, usage: "" };
  };

  const run = (line: string): DevResult => {
    const result = runLine(line);
    notify();
    return result;
  };

  const register = (handle: DevHandle): (() => void) => {
    const handleScenarios = handle.scenarios ?? [];
    for (const command of handle.commands) {
      commands.set(command.name, command);
      unmountedCommands.delete(command.name);
    }

    for (const scenario of handleScenarios) scenarios.set(scenario.name, scenario);
    for (const variable of handle.variables) variables.set(variable.name, variable);
    if (handle.renderer) renderers.push(handle.renderer);
    notify();

    return () => {
      if (handle.renderer) {
        const index = renderers.lastIndexOf(handle.renderer);
        if (index !== -1) renderers = renderers.toSpliced(index, 1);
      }

      for (const command of handle.commands) {
        if (commands.get(command.name) === command) {
          commands.delete(command.name);
          unmountedCommands.set(command.name, command);
        }
      }

      for (const scenario of handleScenarios) {
        if (scenarios.get(scenario.name) === scenario) scenarios.delete(scenario.name);
      }

      for (const variable of handle.variables) {
        if (variables.get(variable.name) === variable) variables.delete(variable.name);
      }

      notify();
    };
  };

  return {
    getRenderer: () => renderers.at(-1)?.(),
    getScenarios: () => Array.from(scenarios.values()),
    getVariables: () => Array.from(variables.values()),
    register,
    run,
    runScenario: (scenario) => runDevScenario(run, scenario),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
