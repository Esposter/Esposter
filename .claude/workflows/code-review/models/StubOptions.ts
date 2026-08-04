import type { Candidate } from "./Candidate";
import type { ScopeAnswer } from "./ScopeAnswer";

/** What one test varies about the default responder. Every leg has a default; a test overrides one or two. */
export interface StubOptions {
  /** What the first reporting finder returns. Ignored when `finderFor` is given. */
  candidates?: Candidate[];
  /** Per-finder answer by label; `null` models a finder that died. */
  finderFor?: (label: string) => Candidate[] | null;
  /** What every resolver returns; `null`/absent models one that died. */
  resolution?: unknown;
  /** Overrides on top of the default Scope answer. */
  scope?: ScopeAnswer;
  /** What the synthesizer returns; `null` (the default) exercises the backfill path. */
  synthesis?: unknown;
  /** Overrides on top of the default CONFIRMED verdict, per candidate index. */
  verdictFor?: (index: number, prompt: string) => Record<string, unknown>;
  /** Per-verifier answer by label; `null` models a verifier that died, so its whole group reaches no verdict. */
  verifierFor?: (label: string) => null | undefined;
}
