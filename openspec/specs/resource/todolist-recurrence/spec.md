## Purpose

A dated todo repeats daily, on weekdays, weekly, monthly or yearly, every so many of them, and ticking it rolls the same todo to its next due date with its steps unticked instead of filling the Completed section.

## Requirements

### Requirement: A dated todo can repeat

A todo with a due date SHALL offer a repeat of Never, Daily, Weekdays, Weekly, Monthly or Yearly, and once it repeats, an Every field for a custom interval.

#### Scenario: Owner sets a repeat

- **GIVEN** a todo with a due date
- **WHEN** the owner chooses Weekly with an interval of two
- **THEN** the todo repeats every two weeks

### Requirement: The custom interval has a limit

An Every interval outside the allowed range SHALL be refused.

#### Scenario: Interval above the maximum

- **GIVEN** a repeating todo
- **WHEN** the owner enters an interval above the maximum
- **THEN** the save is refused

### Requirement: Moving the date moves the repeat's start, and clearing it stops the repeat

Moving a repeating todo's due date by hand SHALL move the date its repeat counts from, and clearing its due date SHALL stop the repeat.

#### Scenario: Due date cleared

- **GIVEN** a repeating todo
- **WHEN** the owner clears its due date
- **THEN** the todo no longer repeats

### Requirement: Ticking a repeating todo rolls it forward

Ticking a repeating todo SHALL move its due date to the next occurrence and untick its steps in one save, leaving it open where it is.

#### Scenario: Owner ticks a daily todo with steps

- **GIVEN** a daily repeating todo with some steps ticked
- **WHEN** the owner ticks it
- **THEN** its due date moves to the next day
- **AND** its steps are unticked
- **AND** it stays open in the list

#### Scenario: Refused roll

- **GIVEN** a repeating todo that the owner ticked
- **WHEN** the save is refused
- **THEN** its due date and steps are restored

### Requirement: Daily, weekday and weekly repeats step from the current due date

Daily, weekday and weekly repeats SHALL move from the todo's current due date.

#### Scenario: Weekday repeat from a Friday

- **GIVEN** a weekdays repeating todo due on a Friday
- **WHEN** the owner ticks it
- **THEN** its due date moves to the following Monday

### Requirement: Monthly and yearly repeats count from the start date

Monthly and yearly repeats SHALL count from the date the repeat was set, so a todo set on the thirty-first returns to the thirty-first after a shorter month.

#### Scenario: Monthly todo set on the thirty-first

- **GIVEN** a monthly todo set on January 31 and ticked on January 31
- **WHEN** its due date moves into February
- **THEN** its due date is the last day of February
- **AND** after the next tick it is due on March 31

### Requirement: The time of day holds across a clock change

The next occurrence SHALL keep the time of day the repeat was set at, even across a daylight-saving change.

#### Scenario: Ticked across a clock change

- **GIVEN** a repeating todo set at nine in the morning
- **WHEN** the owner ticks it across a daylight-saving change
- **THEN** its next due date is at nine in the morning

### Requirement: Choosing Never completes the todo on its next tick

Choosing Never SHALL stop the repeat, so the next tick completes the todo into the Completed section.

#### Scenario: Owner stops a repeat

- **GIVEN** a repeating todo
- **WHEN** the owner chooses Never and ticks it
- **THEN** the todo is completed under Completed

### Requirement: The row marks a repeating todo

A repeating todo's row SHALL mark the repeat beside its due date.

#### Scenario: Repeating todo in the list

- **GIVEN** a repeating todo
- **WHEN** the list is shown
- **THEN** its metadata line marks it as repeating

### Requirement: A rolled todo reminds at its next date

Rolling a repeating todo forward SHALL schedule its due reminder for the new due date.

#### Scenario: Reminder after a roll

- **GIVEN** a repeating todo with a due reminder
- **WHEN** the owner ticks it
- **THEN** a reminder is scheduled for the new due date
