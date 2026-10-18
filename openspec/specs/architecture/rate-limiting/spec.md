## Purpose

The shared Postgres-backed point budgets behind every "rate-limited" procedure, plus the two request budgets that sit outside them.

## Requirements

### Requirement: A budget is shared by every running instance

A rate-limit budget SHALL be shared by every running instance of the app, so that adding instances adds throughput without adding allowance.

#### Scenario: The app runs on several instances

- **GIVEN** the app runs on more than one instance
- **WHEN** one caller makes requests that reach different instances
- **THEN** every request spends from one shared count

### Requirement: Each budget keeps its own keyspace

Each budget SHALL keep its own keyspace, so that spending one budget never spends another.

#### Scenario: Ordinary traffic spends the standard budget

- **GIVEN** a signed-in user has spent a large part of the standard budget
- **WHEN** the same user calls a slow procedure
- **THEN** the slow budget is unaffected

### Requirement: A procedure call spends one point from its budget

Each call to a rate-limited procedure SHALL spend one point from its budget, keyed on the signed-in user, or on the procedure and the caller's address when the caller is anonymous.

#### Scenario: A signed-in user calls a procedure

- **GIVEN** a signed-in user calls a standard procedure
- **WHEN** the call is accepted
- **THEN** one point is spent from the standard budget for that user

#### Scenario: An anonymous caller calls a procedure

- **GIVEN** an anonymous caller calls a standard procedure
- **WHEN** the call is accepted
- **THEN** one point is spent for that procedure and that address

#### Scenario: The standard and slow budgets are sized

- **GIVEN** the standard budget allows one thousand points a minute and the slow budget allows one hundred
- **WHEN** a caller spends its points within one minute
- **THEN** the caller is refused once its budget for that minute is spent

### Requirement: An over-budget call is answered as too many requests

A call that overspends its budget SHALL be answered as too many requests, with the time to retry, and SHALL NOT be answered as a server error.

#### Scenario: A caller exceeds its budget

- **GIVEN** a caller has spent its points for the window
- **WHEN** it calls again
- **THEN** the caller receives a too many requests answer
- **AND** the answer says when to retry

#### Scenario: A caller is within its budget

- **GIVEN** a caller has points left in its window
- **WHEN** its call is accepted
- **THEN** the answer says how many points remain

### Requirement: A caller is charged before its session is checked

A caller SHALL be charged a point before it is told whether it is signed in, so that an unauthenticated caller cannot probe signed-in procedures for free.

#### Scenario: An anonymous caller calls a signed-in procedure

- **GIVEN** an anonymous caller calls a procedure that requires sign-in
- **WHEN** the call is made
- **THEN** a point is spent before the caller is refused for not being signed in

### Requirement: A caller's address comes from the front end's forwarded entry

The address a budget keys on SHALL be the last forwarded entry the front end added, so that a caller cannot mint a fresh budget by sending its own forwarded entries.

#### Scenario: A caller sends its own forwarded entries

- **GIVEN** a caller sends forwarded address entries of its own choosing
- **WHEN** the caller makes requests
- **THEN** the budget is keyed on the address the front end recorded
- **AND** the caller's own entries do not change its budget

### Requirement: Budgets are enforced only in production, except for an unidentifiable anonymous caller

Outside production the budget SHALL NOT be enforced, and in production an anonymous call whose address cannot be determined SHALL be allowed through with a warning.

#### Scenario: The app runs outside production

- **GIVEN** the app runs outside production
- **WHEN** any caller makes a call
- **THEN** no point is spent

#### Scenario: An anonymous call has no determinable address in production

- **GIVEN** the app runs in production
- **WHEN** an anonymous call arrives with no determinable address
- **THEN** the call is allowed through
- **AND** a warning is logged

### Requirement: Each inbound webhook has its own budget

Each inbound webhook SHALL have a budget of thirty points a minute keyed on that webhook, so that one webhook's traffic never spends another's.

#### Scenario: A webhook receives more than its budget

- **GIVEN** a webhook has spent its thirty points in a minute
- **WHEN** it sends another push
- **THEN** the push is refused as too many requests

### Requirement: Asset requests are never locked out

Asset requests SHALL NOT lock an address out after overspending, so that a burst of requests recovers within its window.

#### Scenario: A page's images exceed the asset budget in a burst

- **GIVEN** a burst of asset requests exceeds the asset budget
- **WHEN** the window passes
- **THEN** requests from that address are served again without any lockout period

### Requirement: Sign-in and account endpoints share the standard budget numbers

The sign-in and account endpoints SHALL be limited with the same numbers as the standard procedure budget.

#### Scenario: The sign-in endpoint is called repeatedly

- **GIVEN** a caller repeatedly calls the sign-in endpoint
- **WHEN** it exceeds the standard budget numbers
- **THEN** the caller is refused as too many requests
