import type { FixtureReferenceStatus } from "#src/models/genshinParity/fixtures/FixtureReferenceStatus";

// One fixture screen, or one of its variants, as the parity tooling lists it: where its folder is, whether its approved
// Image is on disk, and the reference it is judged against with that reference's last score and bar (null when the
// Report holds none, and when no reference names it)
export interface FixtureScreenRow {
  bar: number | null;
  directory: string;
  imageExists: boolean;
  lastScore: number | null;
  name: string;
  referenceId: string;
  referenceStatus: FixtureReferenceStatus;
  variant: string;
}
