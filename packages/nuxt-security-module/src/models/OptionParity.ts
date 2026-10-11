export interface OptionParity {
  // The upstream option's name, `headers.<name>` for a header
  upstream: string;
  verdict: "ported" | "changedDefault" | "dropped" | "outOfScope";
  // Our option of the same meaning, for a row that is ported
  ours?: string;
  // The source the changed default cites, or why the option is dropped or out of scope
  note: string;
}
