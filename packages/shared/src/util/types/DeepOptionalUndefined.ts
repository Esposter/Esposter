import type { DeepOptionalProperties } from "@/util/types/DeepOptionalProperties";
import type { DeepRequiredProperties } from "@/util/types/DeepRequiredProperties";
// Handle Functions
export type DeepOptionalUndefined<T> = T extends (...args: unknown[]) => unknown
  ? // Don't transform functions
    T
  : // Handle Arrays
    T extends (infer U)[]
    ? // Recurse on array elements
      DeepOptionalUndefined<U>[]
    : // Handle Readonly Arrays
      T extends readonly (infer U)[]
      ? // Recurse on readonly array elements
        readonly DeepOptionalUndefined<U>[]
      : T extends Date
        ? T
        : // Handle Objects
          T extends object
          ? keyof T extends never
            ? never
            : // Combine required and optional properties correctly
              DeepOptionalProperties<T> extends Record<never, unknown>
              ? DeepRequiredProperties<T>
              : DeepRequiredProperties<T> extends Record<never, unknown>
                ? DeepOptionalProperties<T>
                : DeepOptionalProperties<T> & DeepRequiredProperties<T>
          : T;
