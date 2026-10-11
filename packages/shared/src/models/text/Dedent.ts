import type { DedentOptions } from "#src/models/text/DedentOptions";

export interface Dedent {
  (strings: string | TemplateStringsArray, ...values: unknown[]): string;
  withOptions: (options: DedentOptions) => Dedent;
}
