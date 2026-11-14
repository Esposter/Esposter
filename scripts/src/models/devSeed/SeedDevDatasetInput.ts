import type { Database } from "@esposter/db-schema";

// Everything the seed writes through, injected so a test drives it over an in-memory database
export interface SeedDevDatasetInput {
  db: Database;
}
