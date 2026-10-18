## Purpose

The app's event bus, a typed emitter over an event map kept in @esposter/shared, and the audit of the eventemitter3 package it replaced.

## Requirements

### Requirement: Event names, listeners and arguments are checked against the event map

The emitter SHALL accept only the event names its event map declares, and SHALL type each listener and each emitted argument from the map's entry for that event.

#### Scenario: An undeclared event name is refused at compile time

- **GIVEN** an event map that declares one event
- **WHEN** a caller registers a listener for a different event name
- **THEN** the program does not compile

#### Scenario: A listener with the wrong parameters is refused at compile time

- **GIVEN** an event whose listener takes a number
- **WHEN** a caller registers a listener that takes a string
- **THEN** the program does not compile

### Requirement: The emitter offers only the operations the event bus uses

The emitter SHALL offer on, once, off, emit and removeAllListeners, and SHALL NOT offer prepending, wildcards, listener counts or promise-based waiting.

#### Scenario: A caller looks for a listener count

- **GIVEN** a caller that wants the number of listeners for an event
- **WHEN** the caller looks at the emitter's surface
- **THEN** no listener count operation is offered

### Requirement: Registering a listener that is not a function is refused

The emitter SHALL throw an invalid operation error when a caller registers a listener that is not a function.

#### Scenario: A non-function listener is rejected

- **GIVEN** a value that is not a function
- **WHEN** a caller registers it as a listener with on
- **THEN** an invalid operation error is thrown

### Requirement: Off removes every registration of a listener

The emitter SHALL remove every registration of a listener for an event when a caller turns it off.

#### Scenario: A listener registered twice is removed in one call

- **GIVEN** a listener registered twice for one event
- **WHEN** a caller turns the listener off for that event
- **THEN** the listener is called for no later emit of that event

### Requirement: Emit reports whether any listener was called

The emitter SHALL return true from emit when it calls at least one listener, and false when the event has none.

#### Scenario: An emit with no listeners reports false

- **GIVEN** an event with no listeners
- **WHEN** a caller emits it
- **THEN** the result is false

#### Scenario: An emit with a listener reports true

- **GIVEN** an event with one listener
- **WHEN** a caller emits it
- **THEN** the result is true

### Requirement: Removing all listeners clears one event or every event

The emitter SHALL remove the listeners of the named event when given one, and every event's listeners when given none, and SHALL leave other events' listeners in place when given an empty event name.

#### Scenario: Removing one event's listeners leaves the others

- **GIVEN** two events each with a listener
- **WHEN** a caller removes all listeners of one event
- **THEN** the other event's listener is still called on emit

#### Scenario: Removing all listeners without an event clears every event

- **GIVEN** two events each with a listener
- **WHEN** a caller removes all listeners without naming an event
- **THEN** neither event calls a listener on emit

#### Scenario: An empty event name removes nothing else

- **GIVEN** an event with a listener and an empty event name
- **WHEN** a caller removes all listeners of the empty event name
- **THEN** the other event's listener is still called on emit

### Requirement: Listeners run synchronously in registration order

The emitter SHALL call listeners synchronously, in the order they were registered.

#### Scenario: Listeners run in the order they were registered

- **GIVEN** two listeners registered for one event in order
- **WHEN** a caller emits the event
- **THEN** the first listener is called before the second, within the same emit

### Requirement: A listener changed during an emit takes effect from the next emit

The emitter SHALL run a listener removed during an emit for that emit, and SHALL run a listener added during an emit from the next emit on.

#### Scenario: A listener removed during an emit still runs for it

- **GIVEN** a listener that removes a second listener when called
- **WHEN** a caller emits the event
- **THEN** the second listener still runs for that emit

#### Scenario: A listener added during an emit runs from the next emit

- **GIVEN** a listener that adds a second listener when called
- **WHEN** a caller emits the event twice
- **THEN** the added listener is not called during the first emit
- **AND** it is called during the second emit

### Requirement: A once listener runs at most once even when it emits its own event

The emitter SHALL remove a once listener before any listener runs, so that a listener emitting the same event does not call it twice.

#### Scenario: A once listener that re-emits its event is called once

- **GIVEN** a once listener that emits the same event when called
- **WHEN** a caller emits the event
- **THEN** the once listener is called exactly once

### Requirement: Listeners are called without a bound context

The emitter SHALL call each listener without binding its this to the emitter.

#### Scenario: A listener reads this during an emit

- **GIVEN** a listener that reads this when called
- **WHEN** a caller emits the event
- **THEN** this inside the listener is not the emitter

### Requirement: Every upstream issue and pull request carries exactly one verdict

The audit of the upstream package SHALL record exactly one verdict for every issue and pull request it reads, and every in-scope defect SHALL have a regression case that names it.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue or pull request on the upstream repository
- **WHEN** a reviewer looks it up on the audit page
- **THEN** exactly one verdict is recorded for it
- **AND** an in-scope defect names the regression case that proves it
