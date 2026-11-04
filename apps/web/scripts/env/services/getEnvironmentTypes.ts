import { ENVIRONMENT_EXAMPLE_PATH, EnvironmentVariableTypeMap } from "@@/scripts/env/constants";
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

export const getEnvironmentTypes = () => {
  const names = Object.keys(parseEnv(readFileSync(ENVIRONMENT_EXAMPLE_PATH, "utf8"))).toSorted();
  const properties = names.map((name) => `      ${name}: ${EnvironmentVariableTypeMap[name] ?? "string"};`);
  return `import type { Environment } from "#shared/models/environment/Environment";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
${properties.join("\n")}
    }
  }
}

export {};
`;
};
