## Purpose

One MCP endpoint serves every tRPC procedure that opts in through its meta, authorised by a better-auth API key the owner creates in settings and reaching only the scopes the key was made with — exposing an operation to an agent is one line on its procedure.

## Requirements

### Requirement: Operations opt in as agent tools

The agent endpoint SHALL offer an operation as a tool only when the operation declares itself as one, with a description written for an agent and a scope.

#### Scenario: An operation that declares nothing is not offered

- **GIVEN** an operation that declares no agent tool
- **WHEN** an agent lists its tools
- **THEN** the operation is absent from the list
- **AND** calling the operation by its name is answered as an unknown tool

#### Scenario: A declared operation is offered with its description

- **GIVEN** an operation that declares a description and a scope
- **WHEN** an agent holding that scope lists its tools
- **THEN** the operation appears with that description

### Requirement: Each tool takes one object and has a unique name

Every operation offered as an agent tool SHALL take exactly one object as its input, and no two tools SHALL share a name.

#### Scenario: A tool takes its input as one object

- **WHEN** an agent reads the input description of a tool
- **THEN** the input is a single object described field by field

#### Scenario: Checks refuse a tool that breaks the rule

- **WHEN** the repository's checks run against an operation whose input is not one object or whose name collides with another tool
- **THEN** the checks fail

### Requirement: The endpoint answers each request without pushing

The agent endpoint SHALL answer each request with a single JSON response and SHALL NOT push messages to a client unprompted.

#### Scenario: A request gets one JSON answer

- **WHEN** an agent sends a JSON request message to the endpoint
- **THEN** the endpoint returns one JSON response and closes the request

#### Scenario: Any other method is refused

- **WHEN** a client opens the endpoint with a method other than POST
- **THEN** the endpoint answers 405

### Requirement: Browser-origin requests are refused

The agent endpoint SHALL refuse any request that carries a browser origin header before it reads the request's key.

#### Scenario: A request from a web page is refused

- **WHEN** a request carries an origin header
- **THEN** the endpoint answers 403 without checking the key

#### Scenario: A command-line client is served

- **GIVEN** a request that carries no origin header and a valid key
- **WHEN** the request reaches the endpoint
- **THEN** the endpoint serves the request

### Requirement: Only valid unexpired keys are authenticated

The agent endpoint SHALL serve only requests carrying a valid, unexpired API key and SHALL refuse every other request as unauthenticated or over budget.

#### Scenario: An invalid or expired key is refused

- **WHEN** a request carries a key that is invalid or expired
- **THEN** the endpoint answers 401

#### Scenario: A key over its budget is refused

- **WHEN** a key has used up its request budget for its window
- **THEN** the endpoint answers 429

### Requirement: A key reaches only the tools of its scopes

An API key SHALL reach only the tools of the scopes it was created with, and a tool outside those scopes SHALL look to the caller the same as a name that was never a tool.

#### Scenario: Listing shows only the key's scope

- **GIVEN** a key created with the resources scope only
- **WHEN** the key lists its tools
- **THEN** only tools of the resources scope are listed

#### Scenario: A tool outside the scope is indistinguishable from an unknown name

- **GIVEN** a key created with the resources scope only
- **WHEN** the key calls a tool of another scope
- **THEN** the answer is the same unknown-tool error given for a name that is no tool

#### Scenario: A key with no scope reaches nothing

- **GIVEN** a key created with no scope
- **WHEN** the key lists its tools
- **THEN** no tools are listed

### Requirement: Irreversible operations are never offered to agents

An operation whose effect nothing can undo SHALL NOT be offered to any agent, whatever its declared scope.

#### Scenario: An owner-only operation is hidden from agents

- **GIVEN** an operation declared as owner-only
- **WHEN** an agent holding every scope lists its tools or calls the operation by name
- **THEN** the operation is absent and the call is answered as an unknown tool

#### Scenario: A reversible operation stays available to agents

- **GIVEN** an operation whose effect a revision or the recycle bin can undo
- **WHEN** an agent holding its scope lists its tools
- **THEN** the operation is offered

### Requirement: Agent writes are made as the key owner and attributed to the key

An agent's writes SHALL be made as the owner of its key and SHALL be attributed to that key in the activity log.

#### Scenario: An agent's save names its key in the activity log

- **GIVEN** an agent saves content through its key
- **WHEN** the owner reads the activity log
- **THEN** the entry names the key by the name it held when the agent wrote

#### Scenario: The owner's own saves carry no key

- **WHEN** the owner saves content from a browser
- **THEN** the activity entry names no key

#### Scenario: An agent's write reaches the owner's open tabs live

- **WHEN** an agent writes a resource the owner has open in a tab
- **THEN** the tab shows the change without a reload

### Requirement: Tools declare whether they change anything

Every tool SHALL declare whether it changes anything, so that a client can let reads through without confirmation and keep its prompt for writes.

#### Scenario: A query tool declares itself read-only

- **WHEN** an agent reads the declaration of a query tool
- **THEN** the tool is marked read-only

#### Scenario: A mutation tool declares that it writes

- **WHEN** an agent reads the declaration of a mutation tool
- **THEN** the tool is not marked read-only

### Requirement: API keys are named, shown once and revocable

An API key SHALL be shown in full only once, when it is created, and SHALL be revocable by its owner, after which its next call is refused.

#### Scenario: A new key is created with a name and its scopes

- **GIVEN** the owner is in the API keys section of the user settings
- **WHEN** the owner names a new key and ticks the scopes it holds
- **THEN** the key is shown once in full and listed afterwards by its name and first characters

#### Scenario: A revoked key is refused at its next call

- **GIVEN** a key an agent is using
- **WHEN** the owner deletes that key
- **THEN** the agent's next call is refused

### Requirement: API keys never open the app as a session

An API key SHALL NOT serve as a signed-in session for the app's own routes and SHALL reach only the agent endpoint.

#### Scenario: A key sent to an ordinary app route is not signed in

- **WHEN** a request carries an API key to an ordinary app route
- **THEN** the request is treated as signed out

### Requirement: Each key has its own request budget

Each API key SHALL be limited by its own request budget and window, and each call through a key SHALL also count against the owner's standard request budget.

#### Scenario: A key's calls spend the owner's budget too

- **WHEN** an agent calls a tool through a key
- **THEN** the call also counts against the owner's standard request budget
