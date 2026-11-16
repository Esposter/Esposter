import type { GetProperties } from "#src/util/types/GetProperties";

export type GetPaths<T> = GetProperties<T>["path"];
