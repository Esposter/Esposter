## Purpose

Claude Code sessions in any repository write the follow-ups they leave unfinished into the owner's TodoList, tagged with the repository and session that found them, and drain them again one change at a time until none is left, through the follow-ups plugin and four procedures the MCP endpoint serves.

## Requirements

### Requirement: A session records each follow-up when it finds it

A Claude Code session SHALL write each follow-up it leaves unfinished into the owner's TodoList as soon as it finds it, tagged with the repository and session that found it.

#### Scenario: Follow-up found during a session

- **GIVEN** a Claude Code session in a repository with an origin remote
- **WHEN** the session finds work it leaves undone
- **THEN** a todo naming that work is added to the owner's TodoList
- **AND** the todo records the repository and the session

#### Scenario: Folder with no origin remote

- **GIVEN** a session in a folder with no origin remote
- **WHEN** the session finds work it leaves undone
- **THEN** no follow-up is written

### Requirement: A follow-up is an ordinary todo to the owner

A follow-up SHALL behave as an ordinary todo for sorting, starring, due dates, reminders and printing.

#### Scenario: Owner sorts and is reminded about a follow-up

- **GIVEN** a follow-up with a due date
- **WHEN** the owner sorts the list by due date and the due date arrives
- **THEN** the follow-up is listed in that sort
- **AND** the owner is reminded about it like any other todo

### Requirement: A follow-up shows where it came from

The edit dialog of a follow-up SHALL show its repository and offer a copy of the command that resumes its session.

#### Scenario: Owner opens a follow-up

- **GIVEN** a follow-up written by a session
- **WHEN** the owner opens its dialog
- **THEN** its repository is shown
- **AND** a copy button offers the command that resumes the session

### Requirement: An agent key reaches only open follow-ups

A key made with the follow-ups scope SHALL reach only open follow-ups written by a session, and a key without that scope SHALL reach none of them.

#### Scenario: Key without the follow-ups scope

- **GIVEN** an agent key made without the follow-ups scope
- **WHEN** it calls a follow-up procedure
- **THEN** the call is refused

#### Scenario: Id of a todo the owner wrote

- **GIVEN** a todo the owner wrote, with no session origin
- **WHEN** a follow-ups key tries to complete it by its id
- **THEN** the call answers not found
- **AND** the todo is unchanged

### Requirement: Reading follow-ups returns a repository's open ones in the owner's order

Reading follow-ups for a repository SHALL return its open follow-ups that have not been handed back, in the order the owner set on the list.

#### Scenario: Owner moves a follow-up to the top

- **GIVEN** open follow-ups for one repository
- **WHEN** the owner drags one of them to the top and the follow-ups are read
- **THEN** the dragged follow-up is the first one returned

#### Scenario: Repeating follow-up waiting for its date

- **GIVEN** a repeating follow-up that was completed and rolled to a later due date
- **WHEN** follow-ups are read before that date
- **THEN** that follow-up is not returned

### Requirement: Completing a follow-up ticks it and records what was done

Completing a follow-up SHALL tick it as the checkbox does, append the line the session gave to its notes, and roll a repeating follow-up to its next due date in the time zone given.

#### Scenario: One-off follow-up completed

- **GIVEN** an open follow-up
- **WHEN** a session completes it with a line naming the commit
- **THEN** the follow-up is completed
- **AND** the line is appended to its notes

#### Scenario: Repeating follow-up completed

- **GIVEN** a repeating follow-up with a due date
- **WHEN** a session completes it in a time zone
- **THEN** its due date moves to the next occurrence in that time zone
- **AND** it stays open

### Requirement: Handing back returns a follow-up to the owner with a reason

Handing back a follow-up SHALL leave it open in the list with the reason appended to its notes, and SHALL remove it from what follow-up reads return.

#### Scenario: Session hands back a follow-up

- **GIVEN** an open follow-up that needs a design decision
- **WHEN** a session hands it back with a reason
- **THEN** the reason is appended to its notes
- **AND** it no longer appears in follow-up reads

#### Scenario: Owner returns a handed-back follow-up to the drain

- **GIVEN** a handed-back follow-up
- **WHEN** the owner chooses Return to the drain in its dialog
- **THEN** the follow-up is open for a drain again

### Requirement: A follow-up write does not overwrite the owner's newer save

A follow-up change SHALL be applied to the list as it is when saved, so a save the owner made in the meantime is kept.

#### Scenario: Owner saves while a session writes

- **GIVEN** a session is changing a follow-up
- **WHEN** the owner saves the list in between
- **THEN** the session's change is applied to the owner's newer list
- **AND** the owner's save is kept

### Requirement: A drain works one follow-up at a time

A drain SHALL take follow-ups one at a time, do only those that fit one change without a design decision, and hand back the rest.

#### Scenario: Follow-up needs a design decision

- **GIVEN** a follow-up whose notes leave a choice between readings open
- **WHEN** the drain takes it
- **THEN** the drain hands it back with a reason
- **AND** no change is made for it

#### Scenario: Follow-up would spend outside the review queue

- **GIVEN** a follow-up whose work would open a pull request or spend on a paid service
- **WHEN** the drain takes it
- **THEN** the drain hands it back with a reason

#### Scenario: Follow-up fits one change

- **GIVEN** a follow-up that fits one change with no design decision
- **WHEN** the drain takes it
- **THEN** it is done as one change through the repository's own change loop

### Requirement: A drain ticks a follow-up only once its commit exists

A drain SHALL tick a follow-up only after the commit for its change exists, with a line naming that commit.

#### Scenario: Change committed

- **GIVEN** a change made for a follow-up
- **WHEN** its commit exists
- **THEN** the follow-up is ticked with a line naming the commit

### Requirement: A drain stops when nothing is left

A drain SHALL stop and report what it did when no open follow-up remains for its repository.

#### Scenario: Last follow-up done

- **GIVEN** the repository's last open follow-up was done or handed back
- **WHEN** the drain reads follow-ups
- **THEN** the drain stops and reports what it did

### Requirement: A drain stops when its list stops shrinking

A drain SHALL stop and report that the list is not converging when, after taking as many follow-ups as its checkpoint, the open count is no lower than the checkpoint.

#### Scenario: Work produces follow-ups as fast as it closes them

- **GIVEN** a drain that noted an open count as its checkpoint
- **WHEN** it has taken that many follow-ups and the open count is no lower than the checkpoint
- **THEN** the drain stops and reports that the list is not converging
- **AND** every open follow-up is left for the owner

#### Scenario: Open count fell

- **GIVEN** a drain whose open count has fallen below its checkpoint
- **WHEN** the drain reaches the checkpoint
- **THEN** the lower count becomes the new checkpoint and the drain continues

### Requirement: A drain reads the list fresh on every turn

A drain SHALL read the repository's follow-ups again after every follow-up, so the owner's edits made during the drain are respected.

#### Scenario: Owner edits during a drain

- **GIVEN** a drain is running
- **WHEN** the owner ticks, deletes or reorders a follow-up
- **THEN** the next turn reads the list again and respects that change

### Requirement: The list offers steps to connect an agent

The list SHALL offer a Connect an agent button that shows the steps to connect a session, naming the follow-ups key scope and the plugin's three values.

#### Scenario: Owner connects an agent

- **GIVEN** the owner opens Connect an agent
- **WHEN** the steps are shown
- **THEN** they name the follow-ups scope for a key
- **AND** they name the site, the list and the key as the plugin's values
