## Purpose

How any number of machines share one backlog — each machine pulls its own next entry, claims it as a ref on origin and publishes its load as a ref, so the coordinator's cost does not grow with the machines.

## Requirements

### Requirement: Machines pull their own work

Each machine SHALL take its own next unit of work, and the coordinator SHALL NOT assign work to a machine or name a machine in a rule.

#### Scenario: A machine with nothing it may take

- **GIVEN** a machine with no takeable unit of work
- **WHEN** it looks for work
- **THEN** it stays idle

#### Scenario: A machine joins the fleet

- **GIVEN** a new machine with its own profile
- **WHEN** the machine starts taking work
- **THEN** the coordinator needs no edit

### Requirement: A machine works only the areas it was lent

A machine SHALL take work only in the areas its owner lent it, and the identity and areas the owner set SHALL be kept whenever the profile is written again.

#### Scenario: Work in an area the machine was not lent

- **GIVEN** a machine idle with takeable work in an area it was not lent
- **WHEN** it looks for work
- **THEN** it does not take that work

#### Scenario: The profile is written again

- **GIVEN** a profile whose identity and areas the owner has set
- **WHEN** the profile is written from what the machine detects
- **THEN** the owner's identity and areas are kept

### Requirement: A unit is offered only when it is eligible

A unit of work SHALL be taken only when its needs are met, it is not waiting, no live claim holds it, and its written paths overlap no live claim.

#### Scenario: Units whose paths overlap

- **GIVEN** two units whose written paths overlap
- **WHEN** one of them is claimed
- **THEN** the other waits until the claim ends

#### Scenario: Units whose paths do not overlap

- **GIVEN** two units whose written paths do not overlap
- **WHEN** both are offered
- **THEN** they run in parallel on different machines

#### Scenario: A unit under the waiting heading

- **GIVEN** a unit listed under the waiting heading of a compute page
- **WHEN** machines look for work
- **THEN** the unit is not offered

### Requirement: Exactly one machine wins a claim

A claim on a unit SHALL be won by exactly one machine, so that two machines never work the same unit.

#### Scenario: Two machines claim the same unit at once

- **GIVEN** two machines claiming the same unit at the same moment
- **WHEN** both claims are made
- **THEN** exactly one claim wins
- **AND** the other machine is told which holder has the unit

#### Scenario: A claim goes silent

- **GIVEN** a claim that has not been renewed for thirty minutes
- **WHEN** another machine claims the unit
- **THEN** the new claim replaces the silent one

### Requirement: A claim is renewed and survives network failure

A holder SHALL renew its claim every ten minutes, and a network failure SHALL NOT end a hold.

#### Scenario: A renewal that fails or stalls

- **GIVEN** a holder whose renewal of its claim fails or stalls
- **WHEN** the next renewal interval comes
- **THEN** the failure is logged
- **AND** the renewal is tried again and the hold continues

#### Scenario: A renewal that timed out but landed

- **GIVEN** a renewal push that timed out
- **WHEN** the remote already holds the new commit
- **THEN** the renewal is read as landed

### Requirement: A missed unit keeps its paths held

A unit a machine missed SHALL keep its paths held until the coordinator decides, and SHALL NOT block the machine's new work.

#### Scenario: A machine records a miss

- **GIVEN** a holder that has recorded a miss on its unit
- **WHEN** the claim is released
- **THEN** the claim is kept and the unit waits for the coordinator

#### Scenario: The holder's session lists the miss

- **GIVEN** a held miss
- **WHEN** the holder's session checks its state
- **THEN** the miss is listed as information only
- **AND** it does not block the machine's new work

### Requirement: A finished unit releases its claim

A finished unit SHALL release its claim once its landing is on the shared queue.

#### Scenario: The landing removes the unit

- **GIVEN** a unit whose landing commit removes it from its page
- **WHEN** the landing reaches the shared queue
- **THEN** the claim is deleted
- **AND** the unit's paths are free for other machines

### Requirement: Load is published on an interval and read at a fixed cost

Each machine SHALL publish its load every ten minutes, and the coordinator's status SHALL read the same number of records however many machines the fleet holds.

#### Scenario: The coordinator reports the fleet

- **GIVEN** a fleet of two machines and a fleet of twenty
- **WHEN** the coordinator prints its status
- **THEN** it reads the same number of records in each case

#### Scenario: A heartbeat push fails

- **GIVEN** a machine whose heartbeat push fails or stalls
- **WHEN** the failure occurs
- **THEN** one line is logged
- **AND** the next heartbeat is pushed at the next interval

### Requirement: Game data never leaves a machine through a service

Game data and recordings SHALL NOT be committed, published or sent to any hosted service.

#### Scenario: A machine produces game exports

- **GIVEN** a machine that has extracted game exports
- **WHEN** the exports exist
- **THEN** they stay on that machine

#### Scenario: A copy between machines on the local network

- **GIVEN** two machines on the same local network
- **WHEN** one copies game data from the other
- **THEN** the copy runs only over an authenticated and encrypted connection

#### Scenario: A machine off the local network with no exports

- **GIVEN** a machine off the local network that holds no game exports
- **WHEN** it looks for work
- **THEN** it takes only units that need no game data
