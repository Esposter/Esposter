import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

export interface CutInput extends Pick<PortResult, "fixCount" | "queueShas"> {
  cwd: string;
  developSha: string;
  queueSha: string;
}
