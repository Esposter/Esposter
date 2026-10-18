## Purpose

How nuxt-security-module is configured for the app — the CSP, permissions policy, request size limits, and the two features deliberately turned off.

## Requirements

### Requirement: Every rendered page carries a content policy

Every rendered page SHALL be served with a content security policy that limits which scripts, styles, images, connections, media and frames the browser may load.

#### Scenario: A page is loaded

- **GIVEN** a reader opens any page of the app
- **WHEN** the page is served
- **THEN** the response carries the content security policy
- **AND** the browser enforces it for everything the page loads

### Requirement: Images from any HTTPS address are allowed on every route

A page SHALL display an image from any HTTPS address, so that an image a member posts shows on every route.

#### Scenario: A member posts an image link from another site

- **GIVEN** a member who posts a link to an image hosted on another site over HTTPS
- **WHEN** another member opens the room where it was posted
- **THEN** the image is displayed

#### Scenario: An image link over plain HTTP

- **GIVEN** a member who posts a link to an image served over plain HTTP
- **WHEN** a reader opens the room where it was posted
- **THEN** the image is not displayed

### Requirement: Viewing a remote image reveals the viewer to its host

The app SHALL NOT proxy message images, so an image's host learns each viewer's address and when that viewer opened the room.

#### Scenario: Opening a room with a remote image

- **GIVEN** a room with a message whose image is hosted on another site
- **WHEN** a viewer opens the room
- **THEN** the viewer's browser requests the image from its host
- **AND** the host can see the viewer's address and the time of the request

### Requirement: Camera, microphone, screen capture and fullscreen are granted only to the app

The browser SHALL grant camera, microphone, screen capture and fullscreen only to the app's own pages, never to an embedded third-party frame.

#### Scenario: An embedded third-party frame asks for the camera

- **GIVEN** a third-party page embedded in a frame within the app
- **WHEN** the embedded page asks for the camera or microphone
- **THEN** the browser denies the request

### Requirement: Every script the page loads carries an integrity check

Every script the page loads SHALL carry an integrity check, and a script whose content changes SHALL get a new file name.

#### Scenario: A deploy changes only the entry script

- **GIVEN** a deploy that changes only the application's entry script
- **WHEN** the new version is published
- **THEN** every script that depends on the entry script is published under a new file name
- **AND** a returning reader loads the new version

#### Scenario: An operator changes the header on built scripts

- **GIVEN** a change to the policy header sent with built scripts
- **WHEN** the change is deployed
- **THEN** copies already held by the host's edge keep the old header until the edge's cache is purged

### Requirement: A dedicated worker starts in production

A dedicated worker SHALL start in production because the built scripts it loads carry the embedder policy that allows it.

#### Scenario: A page starts a dedicated worker in production

- **GIVEN** a page served under the embedder policy
- **WHEN** the page starts a dedicated worker
- **THEN** the worker's script is loaded and the worker starts

#### Scenario: Built scripts missing the embedder policy

- **GIVEN** built scripts served without the embedder policy header
- **WHEN** a page in production starts a dedicated worker
- **THEN** the worker fails to start, while the same worker starts outside production

### Requirement: Rich text is sanitised where it is stored

Rich text SHALL be sanitised where it enters the app, so that every stored message, webhook body and post description is already safe to render.

#### Scenario: A message with a plain less-than sign

- **GIVEN** a member who posts a message containing the text a < b
- **WHEN** the message is stored
- **THEN** the message is accepted with its text unchanged

#### Scenario: A message containing a script tag

- **GIVEN** a member who posts a message containing a script tag
- **WHEN** the message is stored
- **THEN** the script tag is removed before the message is stored

### Requirement: Requests are rate limited by one shared mechanism

Requests SHALL be rate limited by the application's one shared rate limiter, with no second limiter answering the same question.

#### Scenario: A client sends too many requests

- **GIVEN** a client that has exceeded the shared limit
- **WHEN** it sends another request
- **THEN** the shared rate limiter refuses the request

### Requirement: An oversized request body is refused before the handler reads it

A request whose body is larger than the configured limit SHALL be refused before any handler reads the body.

#### Scenario: A request body over the limit

- **GIVEN** a request whose body is larger than the configured limit for its kind
- **WHEN** the request arrives
- **THEN** the request is refused before its body is read by the handler
