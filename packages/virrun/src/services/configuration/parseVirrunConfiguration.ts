import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const isBackendType = (value: unknown): value is BackendType =>
  typeof value === "string" && (Object.values(BackendType) as string[]).includes(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === "string");

const toBackendType = (value: unknown, field: "backend" | "fallback"): BackendType => {
  if (isBackendType(value)) return value;
  throw new InvalidOperationError(
    Operation.Read,
    parseVirrunConfiguration.name,
    `\`${field}\` must be one of: ${Object.values(BackendType).join(", ")}`,
  );
};
// Parses and validates the raw `virrun.config.json` text into a VirrunConfiguration. Omitted fields take safe
// Defaults (backend → auto, fallback → native, route → none) so a minimal `{ "route": ["vitest"] }` is valid;
// Present-but-wrong values throw (a typo'd backend or a non-string-array `route` fails loud rather than
// Silently disabling routing). Throws, not getResult, because a malformed committed config is a developer
// Error to surface at the call site, not a recoverable runtime condition.
export const parseVirrunConfiguration = (content: string): VirrunConfiguration => {
  const result = getResult(() => JSON.parse(content) as unknown);
  if (result.isErr())
    throw new InvalidOperationError(
      Operation.Read,
      parseVirrunConfiguration.name,
      `not valid JSON: ${result.error.message}`,
    );

  const value = result.value;
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new InvalidOperationError(Operation.Read, parseVirrunConfiguration.name, "must be a JSON object");

  const { backend = BackendType.Auto, fallback = BackendType.Native, route = [] } = value as Record<string, unknown>;
  if (!isStringArray(route))
    throw new InvalidOperationError(
      Operation.Read,
      parseVirrunConfiguration.name,
      "`route` must be an array of strings",
    );

  return { backend: toBackendType(backend, "backend"), fallback: toBackendType(fallback, "fallback"), route };
};
