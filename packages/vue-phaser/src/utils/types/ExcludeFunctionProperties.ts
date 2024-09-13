import type { FunctionProperties } from "@/utils/types/FunctionProperties";
import type { Except } from "type-fest";

type FunctionPropertyNames<T> = FunctionProperties<T>[keyof T];

export type ExcludeFunctionProperties<T> = Except<T, FunctionPropertyNames<T>>;
