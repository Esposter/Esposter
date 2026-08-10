import type { Clause, ProgramParticipantEntity, Resource } from "@esposter/db-schema";

import { serializeClauses } from "@esposter/db";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// The one definition of "this program's participants" — the capped read, the count that follows it and the
// Idempotent generate must select the same rows, or each would answer for a different question than the others
export const getProgramParticipantFilter = (programId: Resource["id"]): string => {
  const clauses: Clause<ProgramParticipantEntity>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: programId },
  ];
  return serializeClauses(clauses);
};
