import type { TypeBenchCase } from "#src/models/benchTypes/TypeBenchCase";

export interface TypeBenchSource {
  cases: TypeBenchCase[];
  header: string;
}
