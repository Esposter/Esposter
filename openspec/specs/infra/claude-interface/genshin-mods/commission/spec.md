## Purpose

A goal meter — while a turn works through a task list, the band shows the goal, how many tasks are done, the share complete and the time since it started, with the whole list one key away.

## Requirements

### Requirement: A commission opens when a turn first creates a task

A commission SHALL open when a turn first creates a task, with its goal read from the prompt that started the turn.

#### Scenario: A turn that plans a task list

- **GIVEN** a turn whose prompt names a goal
- **WHEN** the turn creates its first task
- **THEN** a commission opens with that goal

#### Scenario: A commission closed by clearing the conversation

- **GIVEN** an open commission
- **WHEN** the conversation is cleared
- **THEN** the commission closes

### Requirement: The band shows the goal, progress and elapsed time

The band SHALL show the goal, the tasks done, the share complete and the whole minutes since the commission opened, with the task in progress beneath.

#### Scenario: A commission part way through

- **GIVEN** a commission with three of four tasks done
- **WHEN** the band is shown
- **THEN** the row reads the goal, three of four, seventy-five percent and the minutes elapsed

### Requirement: A finished commission closes at the next prompt

When every task is done the band SHALL show the commission finished, and the commission SHALL close when the person sends the next prompt.

#### Scenario: Every task done

- **GIVEN** a commission with every task done
- **WHEN** the band is shown
- **THEN** the row shows the commission finished

#### Scenario: The next prompt after completion

- **GIVEN** a finished commission
- **WHEN** the person sends the next prompt
- **THEN** the commission closes

### Requirement: The whole task list opens from the keyboard

With the band focused, the g key SHALL open the whole task list, and pressing it again SHALL close the list.

#### Scenario: Opening the task list

- **GIVEN** the band focused
- **WHEN** the person presses g
- **THEN** the whole list opens with each task marked done, current or waiting

#### Scenario: Closing the task list

- **GIVEN** the task list open
- **WHEN** the person presses g again
- **THEN** the list closes

### Requirement: The commission can be turned off and back on

The commission SHALL stop when the person turns it off and return when they turn it on.

#### Scenario: Turning the commission off

- **GIVEN** a commission running
- **WHEN** the person sends the off command
- **THEN** the band stops showing the commission

#### Scenario: Turning the commission back on

- **GIVEN** the commission turned off
- **WHEN** the person sends the on command
- **THEN** the band shows the commission again

### Requirement: A task update counts only once its call has answered

Each task tool call SHALL change the list only once its result has answered.

#### Scenario: A task call still waiting for its result

- **GIVEN** a task call that has not yet answered
- **WHEN** the band is shown
- **THEN** the list is unchanged by that call
