## Purpose

A band row of what the session is spending — time left on the prompt cache and what a cold cache would re-send, the context window, the five-hour and weekly limits, the cost so far — with one-press warm, compact and handoff, a warning before the cache goes cold, and a usage reserve that has the session clean up on cheap agents as a limit window fills, then wind down before it runs dry, and refuses at launch any agent that would spend the window on a dearer model.

## Requirements

### Requirement: The row shows the session's cache, context, limits and cost

Once the session has sent a request, the band SHALL show the time left on the prompt cache, the context used, the five-hour and weekly limit percentages, and the cost so far.

#### Scenario: A session after its first request

- **GIVEN** a session that has sent a request
- **WHEN** the band is shown
- **THEN** the row shows the cache time left, the context, the limits and the cost

#### Scenario: A figure not yet measured

- **GIVEN** a figure the engine has not measured yet
- **WHEN** the row is shown
- **THEN** that figure is left out rather than shown as zero

### Requirement: A figure takes the warning colour past its threshold

A figure SHALL take the warning colour past its threshold.

#### Scenario: The cache under ten minutes

- **GIVEN** a cache with under ten minutes left
- **WHEN** the row is shown
- **THEN** the cache figure takes the warning colour

#### Scenario: Context at four-fifths of the window

- **GIVEN** context at four-fifths of the window
- **WHEN** the row is shown
- **THEN** the context figure takes the warning colour

### Requirement: Warm renews the cache without adding a transcript row

Warm SHALL renew the prompt cache without adding a row to the transcript.

#### Scenario: Pressing warm

- **GIVEN** a session whose cache is close to expiry
- **WHEN** the person presses warm
- **THEN** the cache is renewed and the transcript gains no row

### Requirement: Compact runs the engine's own compaction

Compact SHALL run the engine's own compaction of the conversation.

#### Scenario: Pressing compact

- **GIVEN** a session with a long conversation
- **WHEN** the person presses compact
- **THEN** the engine's compaction runs

### Requirement: Handoff carries the session into a fresh conversation

Handoff SHALL write a handoff of the session and begin a fresh conversation with it as the first prompt, clearing the old one only after the handoff is written.

#### Scenario: Pressing handoff

- **GIVEN** a session with work in progress
- **WHEN** the person presses handoff
- **THEN** a handoff is written and the fresh conversation starts with it as its first prompt

#### Scenario: The handoff fails

- **GIVEN** a handoff that fails to write
- **WHEN** the handoff is attempted
- **THEN** the conversation is not cleared and a toast says why

### Requirement: A toast warns five minutes before the cache expires

A toast SHALL warn five minutes before the cache expires, once per expiry, and never while a turn is running.

#### Scenario: The cache five minutes from expiry

- **GIVEN** an idle session whose cache is five minutes from expiry
- **WHEN** that moment arrives
- **THEN** a toast warns that the cache is about to go cold

#### Scenario: The cache nearing expiry during a turn

- **GIVEN** a turn running as the cache nears expiry
- **WHEN** that moment arrives
- **THEN** no toast is shown

### Requirement: A usage reserve starts when a limit window runs low

When a limit window passes its maintenance line, or is half spent ahead of an even pace, the session SHALL start a usage reserve naming the window and its reset time.

#### Scenario: The five-hour window passing its maintenance line

- **GIVEN** the five-hour window past its maintenance line
- **WHEN** the measurement arrives
- **THEN** a usage reserve starts naming that window and its reset time

#### Scenario: A window spent ahead of an even pace

- **GIVEN** a window half spent while the share of its length elapsed is smaller
- **WHEN** the measurement arrives
- **THEN** the reserve starts early at its maintenance tier

### Requirement: The session is told the reserve's tier and what it asks

While a reserve holds, the session SHALL be told the window, the line it has passed, its reset time and the instruction of its tier.

#### Scenario: A maintenance reserve

- **GIVEN** a reserve at its maintenance tier
- **WHEN** the session's instructions are read
- **THEN** they ask for the rest of the window to be spent on cleanup agents

#### Scenario: A wind-down reserve

- **GIVEN** a reserve at its wind-down tier
- **WHEN** the session's instructions are read
- **THEN** they ask it to stop new work and have each running agent commit and hand off

### Requirement: Workflow launches are refused while a reserve holds

While a reserve holds and the resin mod is on, a workflow launch SHALL be refused, with the reserve's summary and what to do instead.

#### Scenario: Launching a workflow under a reserve

- **GIVEN** a reserve holding
- **WHEN** a workflow launch is requested
- **THEN** it is denied with the reserve's summary and a suggestion to launch a haiku agent for cleanup or to leave the unit for after the reset

#### Scenario: A haiku agent launched under a reserve

- **GIVEN** a reserve holding
- **WHEN** a haiku agent launch is requested
- **THEN** it is allowed

#### Scenario: The refusal gate failing

- **GIVEN** the launch gate itself failing
- **WHEN** a workflow launch is requested
- **THEN** the launch goes through

### Requirement: The reserve lifts when its window resets

The reserve SHALL lift when its window resets, and no button or command SHALL lift it.

#### Scenario: The window resetting

- **GIVEN** a reserve on a window
- **WHEN** the window resets below its line and the next measurement arrives
- **THEN** the reserve lifts and its section stops being sent

### Requirement: Resin off hides the row, the toasts and the reserve

The resin off command SHALL hide the row, the toasts and the usage reserve's section.

#### Scenario: Turning resin off

- **GIVEN** resin on
- **WHEN** the person sends the off command
- **THEN** the row, the toasts and the reserve section are hidden
