import type { BackendType } from "#src/models/virrun/BackendType";

export interface VirrunBanner {
  backend: BackendType;
  command: readonly string[];
  nodeVersion: string;
}
