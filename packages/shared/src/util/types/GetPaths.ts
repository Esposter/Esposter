import type { GetProperties } from "@/util/types/GetProperties";

export type GetPaths<T> = GetProperties<T> extends infer U ? (U extends { path: infer Path } ? Path : never) : never;
