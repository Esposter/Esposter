## Purpose

The UI library's calendars — a date grid of one day or a range, the date and range fields over it, and an event calendar laid out after Outlook's — built on the platform's Temporal, what each takes from Outlook and Google Calendar, what is left out and why, and how a drag or a double click reaches the page that owns the events.

## Requirements

### Requirement: A calendar day is a plain date with no time zone

A calendar day SHALL be a plain date with no time zone, so that the day shown is the same day for every reader, and a time zone SHALL enter only where a field or an event holds an instant.

#### Scenario: A date field shows an instant as the reader's own day

- **GIVEN** a date field holding an instant
- **WHEN** the field is shown to a reader
- **THEN** the day shown is the day that instant falls on in the reader's own time zone

#### Scenario: A range of days stores plain days

- **WHEN** a reader picks a span of days in a range field
- **THEN** each end is kept as a plain day with no time zone

### Requirement: An event is filed under the day it starts on in the reader's zone

An event SHALL be filed under the day it starts on in the reader's own time zone, and the event views SHALL render only in the browser.

#### Scenario: An evening event appears on its local day

- **GIVEN** an event starting in the evening in the reader's time zone
- **WHEN** the event calendar is shown
- **THEN** the event is filed under that local day

#### Scenario: The event views show a placeholder before the browser draws them

- **WHEN** the page is rendered on the server
- **THEN** the event views show a skeleton in place of the events

### Requirement: Every date grid starts its weeks on Monday

Every date grid SHALL start its weeks on Monday, whatever the reader's locale.

#### Scenario: A month grid begins with Monday

- **WHEN** a reader opens any month grid
- **THEN** the first column of each week is Monday

### Requirement: The event calendar offers four views in Outlook's order

The event calendar SHALL offer the Day, Work week, Week and Month views in that order, switched from its control and by a keyboard shortcut.

#### Scenario: Ctrl+Alt with a digit switches to a view

- **GIVEN** the event calendar is shown
- **WHEN** the reader presses Ctrl+Alt with the digit of a view
- **THEN** the calendar shows that view

#### Scenario: Shortcuts are listed and only work while a calendar is shown

- **WHEN** the reader opens the shortcuts dialog
- **THEN** the calendar's shortcuts are listed, and they do nothing while no calendar is on screen

### Requirement: A calendar grid takes one tab stop and is walked by the keyboard

Each calendar grid SHALL take one stop in the tab order and SHALL be walked by the arrow keys, Home, End and the page keys, so that a reader without a pointer does everything a pointer does.

#### Scenario: Tabbing into the hours starts at the working day

- **WHEN** a reader tabs into the hours view
- **THEN** focus lands on the first slot of the working day

#### Scenario: Stepping past the last day moves to the next view

- **GIVEN** focus on the last day of the view
- **WHEN** the reader presses the arrow key that leaves the view
- **THEN** the next view is shown with focus on its first day

#### Scenario: Enter on an empty slot creates an event there

- **GIVEN** focus on an empty slot where creating is allowed
- **WHEN** the reader presses Enter
- **THEN** the page is asked to create an event at that slot

### Requirement: An event moves by drag or by Alt with an arrow, and only a changed time is emitted

A reader SHALL move an event by dragging it or by pressing Alt with an arrow, and the page SHALL receive the new start only when the start changed.

#### Scenario: Dropping an event on another slot emits its new start

- **GIVEN** an event dropped on a different slot
- **WHEN** the drop completes
- **THEN** the page receives the event's identifier and its new start

#### Scenario: Dropping an event where it already is emits nothing

- **GIVEN** an event dropped on the slot it already occupies
- **WHEN** the drop completes
- **THEN** the page receives no move

#### Scenario: A keyboard move announces the new time

- **GIVEN** an event focused in the hours view
- **WHEN** the reader presses Alt with the down arrow
- **THEN** the event moves one slot down and its new time is read out

### Requirement: A reader creates an event by double click or Enter only where the page allows it

A reader SHALL create an event at a day or slot by double-clicking it or pressing Enter, and creating SHALL be offered only where the page has allowed it.

#### Scenario: A double click on an empty day creates an event at eight

- **GIVEN** the page allows creating events
- **WHEN** the reader double-clicks an empty day in the month view
- **THEN** the page is asked to create an event starting at eight in the morning that day

#### Scenario: Empty slots look unpressable where creating is not allowed

- **GIVEN** the page does not allow creating events
- **WHEN** the reader double-clicks an empty slot
- **THEN** nothing happens and no slot looks pressable

### Requirement: A date range is picked with two presses

A date range SHALL be picked with two presses, and the span SHALL be shown as it is picked.

#### Scenario: The first press sets the start and the second sets the end

- **GIVEN** an empty range
- **WHEN** the reader presses one day and then a later day
- **THEN** the first day is the start and the second is the end

#### Scenario: A press before the start makes it the start

- **GIVEN** a range waiting for its end
- **WHEN** the reader presses a day before the start
- **THEN** that day becomes the start and the old start becomes the end

#### Scenario: Escape keeps the start and drops the end being picked

- **GIVEN** a range waiting for its end
- **WHEN** the reader presses Escape
- **THEN** the start is kept and the span being picked is cleared

### Requirement: A date field closes on a chosen day unless it also takes a time

A date field SHALL close when a day is chosen unless it also takes a time, and a field that may be empty SHALL offer a control that empties it.

#### Scenario: A field that takes a time stays open until Done

- **GIVEN** a date field that takes a time
- **WHEN** the reader chooses a day
- **THEN** the field stays open for the time and closes on Done

#### Scenario: A day chosen on the earliest allowed day lands on the earliest moment

- **GIVEN** a field whose earliest allowed moment is a minute from now
- **WHEN** the reader chooses today
- **THEN** the value is that earliest moment rather than a moment before it

### Requirement: The event calendar leaves out the features the product does not need

The event calendar SHALL NOT offer resizing an event by a drag, all-day or multi-day events, an agenda list, overlaid calendars, recurrence, reminders, invitations or week numbers.

#### Scenario: An event has no resize handle

- **WHEN** a reader looks at an event in the hours view
- **THEN** no handle is offered for resizing it

#### Scenario: No all-day row is shown

- **WHEN** the event calendar is shown
- **THEN** no all-day row appears above the hours
