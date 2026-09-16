import type { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";

export interface ReleaseVerdictLine {
  reason: string;
  verdict: ReleaseVerdict;
}
