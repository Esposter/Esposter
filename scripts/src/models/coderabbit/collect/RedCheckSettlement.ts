import type { Attempts } from "#src/models/coderabbit/collect/Attempts";
import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

// What the red runs on `main`'s head settle to: the first the repairer answers, with its failure signature and the
// Attempts counted against it — or, every one held or past its repairs, the soonest wake any of them stated
export type RedCheckSettlement =
  | { attempts: Attempts; check: MainCheck; retriggerDelaySeconds?: undefined; signature: FailureSignature }
  | { attempts?: undefined; check?: undefined; retriggerDelaySeconds?: number; signature?: undefined };
