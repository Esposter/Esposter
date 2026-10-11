import type { DedentOptions } from "#src/models/text/DedentOptions";

export interface Dedent {
  (strings: TemplateStringsArray | string, ...values: unknown[]): string;
  withOptions: (options: DedentOptions) => Dedent;
}
