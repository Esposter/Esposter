import type { VirrunConfiguration } from "@/models/virrun/VirrunConfiguration";

import { BackendType } from "@/models/virrun/BackendType";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";

const isBackendType = (value: unknown): value is BackendType =>
  typeof value === "string" && (Object.values(BackendType) as string[]).includes(value);

const toBackendType = (value: unknown, field: "backend" | "fallback"): BackendType => {
  if (isBackendType(value)) return value;
  throw new InvalidOperationError(
    Operation.Read,
    parseVirrunConfiguration.name,
    `\`${field}\` must be one of: ${Object.values(BackendType).join(", ")}`,
  );
};
// Parses and validates the raw `virrun.config.json` text into a VirrunConfiguration. Omitted fields take safe
// Defaults (backend → auto, fallback → native) so a minimal `{}` — or no file at all — is valid; present-but-wrong
// Values throw (a typo'd backend fails loud rather than silently changing the sandbox). Throws, not getResult,
// Because a malformed committed config is a developer error to surface at the call site, not a recoverable
// Runtime condition.
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

  const allowedKeys = ["$schema", "backend", "fallback"];
  const unknownKeys = Object.keys(value).filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length > 0)
    throw new InvalidOperationError(
      Operation.Read,
      parseVirrunConfiguration.name,
      `unknown ${unknownKeys.length === 1 ? "key" : "keys"}: ${unknownKeys.join(", ")} (allowed: ${allowedKeys.join(", ")})`,
    );

  const { backend = BackendType.Auto, fallback = BackendType.Native } = value as Record<string, unknown>;
  return {
    backend: toBackendType(backend, "backend"),
    fallback: toBackendType(fallback, "fallback"),
  };
};
