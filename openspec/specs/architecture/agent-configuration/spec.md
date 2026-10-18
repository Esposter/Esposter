## Purpose

Why the agent tree is stored once at .agents with .claude as a symlink alias, and what belongs there rather than in the public docs.

## Requirements

### Requirement: Agent configuration is stored once under one vendor-neutral name

The repository SHALL keep its agent configuration in one stored tree, and any vendor-specific name for it SHALL be an alias that adds no second copy.

#### Scenario: An agent loads its skills through the alias

- **WHEN** Claude Code reads its skills through the vendor-specific name
- **THEN** it reads the same files as the vendor-neutral name holds

#### Scenario: A second agent is added by a link, not a copy

- **WHEN** a second agent vendor needs the configuration
- **THEN** a second alias is added and no file is moved or duplicated

### Requirement: Repository tools skip the alias and the worktree copies

Every repository tool that walks files SHALL ignore the vendor alias and the agent worktree copies, so that the agent tree is never enumerated twice.

#### Scenario: A repository-wide search lists each skill once

- **WHEN** a repository-wide search lists skill files
- **THEN** each skill appears once under the vendor-neutral name

#### Scenario: Worktree copies are not searched

- **GIVEN** live agent worktrees that each hold a full copy of the repository
- **WHEN** a repository-wide check runs
- **THEN** the worktree copies are not checked

### Requirement: Executable recipes live in the scripts package

Any recipe of more than one command SHALL be a named script with its own test in the scripts package, and the agent tree SHALL hold only rules an agent reads.

#### Scenario: A multi-command recipe is run by a named script

- **WHEN** an agent needs a recipe of more than one command
- **THEN** it runs a named script with a repository-wide prefix for agent tooling

#### Scenario: The agent tree holds no executables

- **WHEN** the agent tree is checked
- **THEN** it contains rules and configuration only

### Requirement: Explanatory documentation is public and the agent tree holds only machine input

Explanatory documentation SHALL live in the OpenSpec tree, which the repository host renders publicly, and the agent tree SHALL hold only what a machine consumes.

#### Scenario: A decision a person would read lives in the specs

- **WHEN** a convention needs an explanation a person reads in a browser
- **THEN** the explanation is a page in the OpenSpec tree and the skill links to it

#### Scenario: A sweep ledger lives in the agent tree

- **WHEN** progress through a repository-wide sweep is recorded
- **THEN** the progress is kept as a ledger in the agent tree

### Requirement: Vendored skills are committed and excluded from repository scans

A third-party skill the repository depends on SHALL be committed in the agent tree, and every scan of repository-authored rules SHALL leave it out.

#### Scenario: A checkout has the vendored skill without an install step

- **WHEN** a fresh checkout is made
- **THEN** the vendored skill is present without running an installer

#### Scenario: Scans skip vendored skills

- **WHEN** the skill documentation checks run
- **THEN** the vendored skills are not checked against the repository's rules

### Requirement: Engineering skills are pointed at the agent tree

An engineering skill that looks for its configuration under a root docs folder SHALL be pointed at the agent tree, and no root docs folder SHALL be created.

#### Scenario: A skill finds its configuration under the agent tree

- **WHEN** an engineering skill looks for its issue tracker configuration
- **THEN** the repository instruction file names the agent tree path where it is kept

#### Scenario: Setup is not re-run into a second copy

- **WHEN** an engineering skill offers to re-run its setup
- **THEN** the setup is not run and no root docs folder is created

### Requirement: Plugin enablement is written where it is tracked

A plugin enabled or disabled through the vendor tool SHALL have that change written to the tracked settings file, so that no local-only change escapes review.

#### Scenario: Disabling a plugin changes a tracked file

- **WHEN** a plugin is disabled through the vendor tool
- **THEN** the tracked settings file shows the change

### Requirement: Exclusions match the shared path constants

Every tool's exclusion of the alias and the worktrees SHALL match the repository's shared path constants, and a check SHALL fail when a copy diverges.

#### Scenario: A diverging exclusion fails the check

- **GIVEN** a tool configuration whose exclusion no longer matches the shared constant
- **WHEN** the repository's checks run
- **THEN** the check fails and names the configuration
