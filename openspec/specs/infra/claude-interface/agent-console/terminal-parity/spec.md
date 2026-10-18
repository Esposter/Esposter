## Purpose

The agent console's acceptance test, walked row by row. Every surface the Claude Code terminal shows and every action it takes, the part of the page that carries it, and where the console still falls short, each named rather than hidden.

## Requirements

### Requirement: The conversation shows what the terminal shows

The console SHALL show the conversation with thinking, streaming replies, the working line and the turn's token count, as the terminal does.

#### Scenario: A turn in progress

- **GIVEN** a turn in progress
- **WHEN** the conversation is shown
- **THEN** the reply streams, its thinking is folded, and a working line closes the conversation with elapsed time and the tokens written

#### Scenario: Interrupting the turn

- **GIVEN** a turn in progress
- **WHEN** the person presses the stop button or Escape
- **THEN** the turn is interrupted

### Requirement: Tool calls and file edits are shown in place

The console SHALL show each tool call in place in the conversation and each file edit as a side-by-side diff, with the changes tab merging every edit to a file into one diff.

#### Scenario: A file edited twice in one session

- **GIVEN** a file edited twice in the session
- **WHEN** the changes tab is opened
- **THEN** the edits are merged into one diff from where the file started

#### Scenario: A tool call made by the main agent

- **GIVEN** a tool call made by the main agent
- **WHEN** it completes
- **THEN** it is shown in the conversation at the point it was made

### Requirement: Subagents and background tasks appear on the timeline

The timeline SHALL show a lane per subagent, marked with its status, and SHALL let a running subagent or background command be stopped.

#### Scenario: Stopping a running background command

- **GIVEN** a running background command with its lane on the timeline
- **WHEN** the person presses Stop on the lane
- **THEN** the command is stopped

### Requirement: Permission prompts show the whole input and accept a verdict with a message

The console SHALL show each permission prompt with its whole tool input and SHALL accept allow, always allow, or deny with a message.

#### Scenario: Denying a prompt with a message

- **GIVEN** a permission prompt
- **WHEN** the person denies it with a message
- **THEN** the denial and its message reach the agent

#### Scenario: A file edit a prompt is asking about

- **GIVEN** a permission prompt about a file edit
- **WHEN** it is shown
- **THEN** the edit is shown as its diff

### Requirement: The console shows the model, context used, cost and plan usage

The console SHALL show the model, context used, cost so far and the plan's usage window, and SHALL warn before automatic compaction.

#### Scenario: Context nearing the compaction threshold

- **GIVEN** a session whose context reaches nine tenths of the compaction threshold
- **WHEN** the heads-up display is shown
- **THEN** it warns that compaction is near

### Requirement: Todo list, hook output and the persona's start output are shown

The console SHALL show the todo list at the top of the timeline, hook output as a folded row, and the session-start output with the character named by the Genshin theme.

#### Scenario: A session starting with the persona plugin

- **GIVEN** a session starting with the persona plugin's hooks
- **WHEN** the session starts
- **THEN** the hook's output appears as a folded row and the Genshin theme names the character

### Requirement: The console carries the terminal's actions

The console SHALL offer sending prompts, attaching files, interrupting, backgrounding, slash commands, plan and bypass modes, model switching, resume, fork and rewind.

#### Scenario: Sending background work

- **GIVEN** a turn running with commands or subagents
- **WHEN** the person presses Background or Ctrl+B
- **THEN** the work continues in the background

#### Scenario: Rewinding a conversation

- **GIVEN** a message in the conversation
- **WHEN** the person rewinds from it
- **THEN** the conversation is put back to that message

#### Scenario: Rewinding the files from a prompt

- **GIVEN** a prompt in the conversation
- **WHEN** the person rewinds the files from it
- **THEN** the files are put back as they were before that prompt

### Requirement: Every surface the console does not match is named as partial

Each terminal surface the console does not carry SHALL be named in the parity table with what is missing.

#### Scenario: The spinner's tips

- **GIVEN** the terminal's spinner tips
- **WHEN** the parity table is read
- **THEN** the row names the tips as missing, since the SDK sends none

### Requirement: The console offers what the terminal cannot

The console SHALL offer parallel sessions with their states, a notification when a hidden session needs attention, a search over the session, and a diff for every edit.

#### Scenario: A hidden session needing attention

- **GIVEN** a session in a hidden tab that needs an answer
- **WHEN** the question arrives
- **THEN** the person is notified
