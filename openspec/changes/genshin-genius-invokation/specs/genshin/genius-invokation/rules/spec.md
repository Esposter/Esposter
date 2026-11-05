## REMOVED Requirements

### Requirement: A duel ends with no winner after its fifteenth round

**Reason**: the duel ends with no winner at the start of Round 15, before its roll, as the game's Round Limit text gives it, so the fifteenth round's end phase no longer decides it and its scenario no longer holds. The replacement below takes its place.

## ADDED Requirements

### Requirement: A duel ends with no winner when Round 15 would begin

A duel SHALL end with no winner, both sides losing, when Round 15 would begin, before its roll is made.

#### Scenario: A duel with no winner concedes once Round 15 begins

- **GIVEN** no winner has been decided by the start of Round 15
- **WHEN** Round 15 would begin
- **THEN** both sides concede with no winner before its roll is made
