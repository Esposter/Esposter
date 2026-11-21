## Purpose

A band row of what the session is spending — time left on the prompt cache and what a cold cache would re-send, the context window, the five-hour and weekly limits, the cost so far — with one-press warm, compact and handoff, and a warning before the cache goes cold.

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

### Requirement: Resin off hides the row and the toasts

The resin off command SHALL hide the row and the toasts.

#### Scenario: Turning resin off

- **GIVEN** resin on
- **WHEN** the person sends the off command
- **THEN** the row and the toasts are hidden
