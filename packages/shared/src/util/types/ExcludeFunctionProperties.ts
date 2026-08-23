import type { FunctionProperties } from "#src/util/types/FunctionProperties";
import type { Except } from "type-fest";

export type ExcludeFunctionProperties<T> = Except<T, FunctionProperties<T>[keyof T]>;
