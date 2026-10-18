## Purpose

Web-push reminders when a TodoList item's due date arrives, riding the existing scheduled-job and push subsystems.

## Requirements

### Requirement: A due date sends the owner a reminder

A todo with a due date SHALL send its owner a reminder when the due date arrives, to every device the owner has subscribed.

#### Scenario: Due date arrives

- **GIVEN** an open todo with a due date in the future
- **WHEN** the due date arrives
- **THEN** the owner receives a notification saying the todo is due
- **AND** the notification appears in the owner's notification bell

### Requirement: Clicking a reminder opens the list

Clicking a due reminder SHALL open the todo's list at its Items view.

#### Scenario: Owner clicks the reminder

- **GIVEN** a due reminder for a todo
- **WHEN** the owner clicks it
- **THEN** the list's Items view opens

### Requirement: Only the owner receives a reminder

A todo reminder SHALL go to the list's owner alone.

#### Scenario: Reminder for a single-owner list

- **GIVEN** a TodoList with one owner
- **WHEN** a reminder fires
- **THEN** the owner is the only recipient

### Requirement: Setting a due date schedules one reminder

Setting or changing a todo's due date SHALL schedule one reminder at that time, and saving again without a change to the date SHALL NOT schedule another.

#### Scenario: Due date set

- **GIVEN** an open todo with no due date
- **WHEN** the owner sets a future due date and saves
- **THEN** one reminder is scheduled for that time

#### Scenario: Save without a date change

- **GIVEN** a todo whose reminder is already scheduled
- **WHEN** the owner saves the list without changing its due date
- **THEN** no further reminder is scheduled

### Requirement: A due date already past does not remind

A due date that is already in the past when saved SHALL NOT schedule a reminder.

#### Scenario: Date set in the past

- **GIVEN** an open todo
- **WHEN** the owner saves a due date earlier than now
- **THEN** no reminder is scheduled

### Requirement: A reminder is dropped when the todo no longer needs it

When a reminder comes due, it SHALL be dropped without a notification if the todo was deleted, its due date has since changed, or the todo was completed.

#### Scenario: Todo deleted before its due time

- **GIVEN** a reminder scheduled for a todo
- **WHEN** the todo is deleted before the reminder fires
- **THEN** no notification is sent

#### Scenario: Due date moved

- **GIVEN** a reminder scheduled for one due time
- **WHEN** the todo's due date is moved and the old time arrives
- **THEN** no notification is sent for the old time

### Requirement: A reminder never fails a save

Scheduling a reminder SHALL NOT make a save fail, and a failed scheduling SHALL NOT block the owner's save.

#### Scenario: Scheduling fails

- **GIVEN** the reminder service is unavailable
- **WHEN** the owner saves a list with a new due date
- **THEN** the save succeeds

### Requirement: A reminder may be sent more than once

A reminder SHALL be sent at least once, and MAY be sent twice when a due date was moved away and back.

#### Scenario: Due date moved away and back

- **GIVEN** a todo whose due date was moved away and then back to the same time
- **WHEN** the due time arrives
- **THEN** the owner may receive the reminder twice

### Requirement: A reminder fires at the due time

A reminder SHALL fire at exactly the todo's due date and time, with no lead time.

#### Scenario: Reminder at the exact time

- **GIVEN** an open todo due at a set time
- **WHEN** that time arrives
- **THEN** the reminder is sent at that time
