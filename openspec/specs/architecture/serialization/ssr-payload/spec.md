## Purpose

How a class instance in Pinia state or useAsyncData is carried into the HTML payload and revived as its class on hydration.

## Requirements

### Requirement: Class instances in page state arrive as instances after page load

A class instance held in page state SHALL reach the browser after the page loads as an instance of the same class, with its methods and with its dates as dates.

#### Scenario: A stored room is rendered by the server

- **GIVEN** a page rendered by the server whose state holds a room instance
- **WHEN** the page hydrates in the browser
- **THEN** the room is an instance of its class with its methods
- **AND** the room's dates are dates

#### Scenario: Dates are carried in the page as text

- **GIVEN** a page rendered by the server with a class instance in its state
- **WHEN** the page's HTML is produced
- **THEN** the instance's dates appear in the HTML as text
