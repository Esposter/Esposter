## Purpose

How a class instance crosses a tRPC HTTP or WebSocket link, through the SuperJSON transformer's registerCustom hook for each registered class.

## Requirements

### Requirement: Registered class instances keep their dates across API calls

A registered class instance that an API call returns or receives SHALL arrive on the other side as an instance of the same class with its dates as dates, over both request links and live connections.

#### Scenario: A procedure returns a room over HTTP

- **GIVEN** a procedure that returns a registered room instance
- **WHEN** a client calls the procedure over an HTTP request
- **THEN** the client receives a room instance with its dates as dates

#### Scenario: A live connection carries a registered instance

- **GIVEN** a live connection that delivers a registered instance
- **WHEN** the client receives the instance
- **THEN** the instance is revived as its class with its dates as dates

#### Scenario: A value that is not a registered class

- **GIVEN** a value that is not a registered class instance
- **WHEN** it crosses an API call
- **THEN** it is not revived as a class by the transport
