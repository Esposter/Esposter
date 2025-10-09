import type { DeepOptionalProperties } from "@/util/types/DeepOptionalProperties";
import type { DeepRequiredProperties } from "@/util/types/DeepRequiredProperties";

export type DeepOptionalUndefined<T> = T extends (...args: unknown[]) => unknown // Handle Functions
  ? T // Don't transform functions
  : T extends (infer U)[] // Handle Arrays
    ? DeepOptionalUndefined<U>[] // Recurse on array elements
    : T extends readonly (infer U)[] // Handle Readonly Arrays
      ? readonly DeepOptionalUndefined<U>[] // Recurse on readonly array elements
      : T extends Date
        ? T
        : T extends object // Handle Objects
          ? keyof T extends never
            ? never
            : // Combine required and optional properties correctly
              DeepOptionalProperties<T> extends Record<never, unknown>
              ? DeepRequiredProperties<T>
              : DeepRequiredProperties<T> extends Record<never, unknown>
                ? DeepOptionalProperties<T>
                : DeepOptionalProperties<T> & DeepRequiredProperties<T>
          : T;
