## ADDED Requirements

### Requirement: Worker timers keep their count through a hidden tab

A worker-timers interval SHALL keep its count against the wall clock while its tab is hidden, where a main-thread interval drifts.

#### Scenario: a worker interval keeps its count through a hidden tab

- **GIVEN** a tab running a worker-timers interval and a main-thread interval
- **WHEN** the tab is hidden for a fixed span and shown again
- **THEN** the worker interval's count matches the wall clock within one tick
- **AND** the main-thread interval's count falls behind it
