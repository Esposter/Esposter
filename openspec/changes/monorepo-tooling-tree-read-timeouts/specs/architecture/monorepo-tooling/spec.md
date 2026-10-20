## ADDED Requirements

### Requirement: A whole-tree workspace suite's timeout is the one its contended run earns

A whole-tree suite in `scripts/src/workspace` SHALL declare `TREE_READ_TIMEOUT_MS` only where the full parallel `scripts` run shows it exceeding Vitest's default, and the rule that governs that choice SHALL be the same in every skill that states it.

#### Scenario: a whole-tree suite passes the parallel run at the default

- **GIVEN** the full `scripts` workspace suite running in parallel
- **WHEN** a whole-tree suite without `TREE_READ_TIMEOUT_MS` reads the tree while its siblings do the same
- **THEN** that suite passes under the default timeout
- **AND** the override stays removed, with the measured duration in the commit body
