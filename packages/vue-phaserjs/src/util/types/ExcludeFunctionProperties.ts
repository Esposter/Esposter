import type { FunctionProperties } from "@/util/types/FunctionProperties";
import type { Except } from "type-fest";

export type ExcludeFunctionProperties<T> = Except<T, FunctionProperties<T>[keyof T]>;
