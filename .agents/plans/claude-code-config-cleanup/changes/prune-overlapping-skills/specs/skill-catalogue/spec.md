## Purpose

The team's plugins carry skills and agents that are loaded into context, so every duplicate costs tokens and risks drift. Each job should have one owner, and a skill should be a procedure rather than a name for another skill.

## ADDED Requirements

### Requirement: Each job has one owner

A job SHALL be owned by one skill or one agent, and an agent that performs a job SHALL name the skill that holds its procedure rather than restate it.

#### Scenario: Agent restating a skill is refused

- **GIVEN** an agent file whose body repeats a skill's checklist
- **WHEN** the configuration check runs
- **THEN** the check fails and names the agent and the skill

#### Scenario: Agent naming its skill passes

- **GIVEN** an agent file that loads a named skill for its procedure
- **WHEN** the configuration check runs
- **THEN** the check passes

### Requirement: No skill is a bare alias

A skill SHALL NOT exist only to call another skill.

#### Scenario: Alias skill is refused

- **GIVEN** a skill whose body only calls another skill
- **WHEN** the configuration check runs
- **THEN** the check fails and names the alias and its target
