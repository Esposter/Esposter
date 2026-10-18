## Purpose

Whose a branch is, read off its name alone — ai/queue the sessions' and Renovate's landing branch, main the reviewed prefix of it, ai/* one writer's, renovate/* the bot's, external/* a collaborator's, everything else the maintainer's — and the rulesets that make the name the rule.

## Requirements

### Requirement: A branch name determines its owner

A branch's name SHALL determine who may create it, who may push it and how it reaches main, with no separate record of ownership.

#### Scenario: Reading ownership from a branch name

- **GIVEN** a branch named under one of the namespaces
- **WHEN** a person checks who may create and push it
- **THEN** the answer follows from the namespace alone

### Requirement: Main is updated only by the review's fast-forward

The main branch SHALL be updated only by the review's fast-forward, so that main is always an ancestor of the queue.

#### Scenario: A collaborator pushes to main

- **GIVEN** a collaborator without the maintainer role
- **WHEN** they try to update main
- **THEN** the update is refused

#### Scenario: The review moves main to the window's end

- **GIVEN** a reviewed window of commits on the queue
- **WHEN** the review passes
- **THEN** main fast-forwards to the end of that window

#### Scenario: A branch other than the queue sources a main update

- **GIVEN** a branch other than the queue holding new commits
- **WHEN** someone tries to bring it into main
- **THEN** the update is refused

### Requirement: Every change reaches main through the queue and the review

Every change SHALL reach main through the queue and the review, so that nothing lands on main unread.

#### Scenario: A session pushes a commit

- **GIVEN** a working session with a finished commit
- **WHEN** it pushes the commit
- **THEN** the commit lands on the queue and is reviewed before it can reach main

### Requirement: Renovate's pull requests merge into the queue once checks pass

Renovate's pull requests SHALL target the queue and merge automatically once their required checks pass.

#### Scenario: A dependency update with passing checks

- **GIVEN** a Renovate pull request against the queue
- **WHEN** its required checks pass
- **THEN** it merges automatically and is then reviewed like any session's commit

#### Scenario: A dependency update with failing checks

- **GIVEN** a Renovate pull request against the queue
- **WHEN** a required check fails
- **THEN** it does not merge

### Requirement: Collaborator changes arrive as a squash-merged pull request against the queue

A collaborator's change SHALL arrive as a pull request from an external branch against the queue, squash-merged there by a maintainer.

#### Scenario: A collaborator's change squash-merged

- **GIVEN** an external branch with a pull request against the queue
- **WHEN** a maintainer squash-merges it
- **THEN** its title and body become the one commit that lands on the queue

#### Scenario: A collaborator opens a pull request against main

- **GIVEN** a collaborator's branch
- **WHEN** they open a pull request against main
- **THEN** the pull request stays open but cannot be merged

### Requirement: Pull requests into the queue pass its status checks

A pull request into the queue SHALL pass the queue's status checks before it merges.

#### Scenario: A pull request with failing checks

- **GIVEN** a pull request into the queue
- **WHEN** a status check fails
- **THEN** the merge is held

#### Scenario: A session's plain push to the queue

- **GIVEN** a session pushing to the queue as the admin account
- **WHEN** the push is made
- **THEN** it is not held to the status checks

### Requirement: Branch creation is limited to the namespaces that may create branches

Branch creation SHALL be limited to the namespaces that may create a branch.

#### Scenario: A branch created under a namespace that may create it

- **GIVEN** a branch name under a namespace allowed to create branches
- **WHEN** it is created
- **THEN** the creation succeeds

#### Scenario: A branch created under a namespace that may not create it

- **GIVEN** a branch name under a namespace not allowed to create branches
- **WHEN** someone tries to create it
- **THEN** the creation is refused

### Requirement: The queue is the default branch

The queue SHALL be the repository's default branch.

#### Scenario: A pull request opened without naming a base

- **GIVEN** a new pull request with no base branch named
- **WHEN** it is opened
- **THEN** it targets the queue
