## Purpose

Every issue and pull request on Baroshem/nuxt-security, open and closed, with its verdict from the dependency admission triage, before nuxt-security-module writes any code. The audit records each upstream item's verdict and its severity, and each defect is reproduced before it is treated as ours to fix.

## Requirements

### Requirement: Every upstream item is audited before the module's code is written

The audit SHALL cover every issue and pull request on the upstream tracker, open and closed, and SHALL be complete before any code for the module is written.

#### Scenario: Module code waits for a complete audit

- **GIVEN** the upstream tracker holds issues and pull requests, open and closed
- **WHEN** code for the module is about to be written
- **THEN** every one of those items already has a recorded verdict

### Requirement: Each upstream item carries exactly one verdict

Each upstream item SHALL carry exactly one verdict from the audit's set: defect, fixed upstream, already built, out of scope, false positive, noise, or fix.

#### Scenario: A pull request is counted once against the issue it closes

- **GIVEN** a pull request that closes an issue
- **WHEN** the audit counts the item
- **THEN** the fix is counted once against that issue and not again as a separate item

### Requirement: Each upstream item is graded for security severity

Each upstream item SHALL be graded for security severity as high, medium, low or none.

#### Scenario: Severity follows the harm an attacker or a user would meet

- **GIVEN** an upstream item
- **WHEN** it is graded
- **THEN** it is high when an attacker can use it to bypass a protection or leak data
- **AND** it is medium when a protection is wrong or a header misbehaves for real users
- **AND** it is low when it is cosmetic or only hardening
- **AND** it is none when the security lens does not reach it

### Requirement: A defect is reproduced by a regression test that fails on upstream first

A defect SHALL be treated as reproduced only when its regression test fails against the upstream package and passes against this module.

#### Scenario: A regression test that passes upstream does not reproduce the defect

- **GIVEN** a regression test written for an upstream defect
- **WHEN** the test passes against the upstream package
- **THEN** the item is classified as fixed upstream, as needing the app, or as not reproducing, and not as a reproduced defect

### Requirement: A defect in a feature the configuration turns off does not reach requests

A defect that sits in a feature the app's configuration turns off SHALL NOT reach the requests the app serves.

#### Scenario: The disabled markup filter leaves uploads and rich text untouched

- **GIVEN** the app's configuration with the markup filter turned off
- **WHEN** a member uploads a file or sends rich text
- **THEN** the markup filter's defects do not affect the request

### Requirement: A client-written forwarded address does not change the rate-limit key

A forwarded-address or client-IP header written by the client SHALL NOT change the key a request is rate limited under.

#### Scenario: A made-up forwarded address does not escape the rate limit

- **GIVEN** a client that is already rate limited
- **WHEN** the client sends a request with a forwarded-address header carrying a different address
- **THEN** the request is still counted under the client's own rate-limit key

### Requirement: Rate limits are set per route in the route's own rules

A route that needs its own rate limit SHALL have it set in that route's rules.

#### Scenario: A route sets its own rate limit

- **GIVEN** a route that needs a rate limit different from the default
- **WHEN** the route's rules are read
- **THEN** the route's own limit applies to requests to that route

### Requirement: State-changing requests must repeat the anti-forgery token

The app SHALL refuse a state-changing request whose anti-forgery header does not repeat the token held in its cookie.

#### Scenario: A safe request receives an anti-forgery cookie

- **GIVEN** a safe request from a browser with no anti-forgery cookie
- **WHEN** the response is sent
- **THEN** the response sets a random token in a cookie

#### Scenario: A state-changing request with a mismatched token is refused

- **GIVEN** a state-changing request whose anti-forgery header does not match its cookie
- **WHEN** the request is received
- **THEN** the request is refused

### Requirement: Rich text is sanitised when saved, not rejected by a markup filter

Rich text SHALL be sanitised at the point it is saved and SHALL NOT be rejected by a request-wide markup filter.

#### Scenario: Ordinary text with markup is accepted

- **GIVEN** a member sending a message with ordinary text and formatting
- **WHEN** the message is submitted
- **THEN** the message is accepted and sanitised when it is saved

### Requirement: A feature request is built only when it meets the audit bar

A feature request SHALL be built only when it is a security best practice a web app reasonably needs, is cheap to build, and fits the module's shape.

#### Scenario: A feature request that misses the bar is recorded, not built

- **GIVEN** a feature request
- **WHEN** it is triaged
- **THEN** it is either recorded as already built or as out of scope with its reason
- **AND** it is built only when it meets all three parts of the bar
