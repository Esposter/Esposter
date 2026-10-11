import type { OptionParityVerdict } from "#src/models/OptionParityVerdict";

export interface OptionParity {
  // The source the changed default cites, or why the option is dropped or out of scope
  note: string;
  // Our option of the same meaning, for a row that is ported
  ours?: string;
  // The upstream option's name, `headers.<name>` for a header
  upstream: string;
  verdict: OptionParityVerdict;
}
