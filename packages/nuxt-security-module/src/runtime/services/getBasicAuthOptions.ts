import type { BasicAuthOptions } from "#src/models/BasicAuthOptions";

import { checkIsRecord } from "#src/runtime/services/checkIsRecord";

const checkIsStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

// The basic auth options the module wrote into the server-only runtime config.
// `undefined` when basic auth is off or the config holds no valid options.
// The config is typed as unknown, so each field is checked before it is read
export const getBasicAuthOptions = (privateRuntimeConfig: unknown): BasicAuthOptions | undefined => {
  if (!checkIsRecord(privateRuntimeConfig) || !checkIsRecord(privateRuntimeConfig.basicAuth)) return undefined;

  const { exclude, include, message, name, pass } = privateRuntimeConfig.basicAuth;
  if (typeof name !== "string" || typeof pass !== "string") return undefined;

  return {
    ...(checkIsStringList(exclude) && { exclude }),
    ...(checkIsStringList(include) && { include }),
    ...(typeof message === "string" && { message }),
    name,
    pass,
  };
};
