## Purpose

The Publishable capability — versioned publish copy plus a public, rate-limited, read-only route.

## Requirements

### Requirement: Only publishable resource types offer publishing

A resource type SHALL offer publishing only when it declares itself publishable, and a type that does not SHALL offer no publish operation at all.

#### Scenario: A publishable type is opened

- **GIVEN** a resource type declares itself publishable
- **WHEN** its owner opens it
- **THEN** the publish and unpublish operations are offered

#### Scenario: A non-publishable type is opened

- **GIVEN** a resource type does not declare itself publishable
- **WHEN** its owner opens it
- **THEN** no publish operation is offered
- **AND** a request for one is answered as not found

### Requirement: A published resource is served from a snapshot

A published resource SHALL be served from a snapshot taken when it was published, so that later edits stay private until the owner publishes again.

#### Scenario: The owner edits after publishing

- **GIVEN** a resource is published
- **WHEN** the owner edits it without publishing again
- **THEN** public viewers still see the snapshot taken at publish time

#### Scenario: The owner publishes again

- **GIVEN** a resource was edited after it was published
- **WHEN** the owner publishes it again
- **THEN** public viewers see the newly published content

### Requirement: Public viewers read the snapshot without signing in

Anonymous visitors SHALL read the published snapshot of a resource and never its working copy, and their reads SHALL be rate-limited.

#### Scenario: An anonymous visitor opens a published address

- **GIVEN** a resource is published
- **WHEN** an anonymous visitor opens its public address
- **THEN** the visitor sees the published snapshot

#### Scenario: An anonymous visitor opens an unpublished address

- **GIVEN** a resource is not published
- **WHEN** an anonymous visitor opens its public address
- **THEN** the visitor sees a not found response

#### Scenario: An anonymous visitor exceeds the read budget

- **GIVEN** an anonymous visitor has spent its read budget
- **WHEN** it reads a published address again
- **THEN** the visitor is refused as too many requests

### Requirement: Unpublishing removes the public address

Unpublishing a resource SHALL make its public address stop resolving and SHALL remove its published versions.

#### Scenario: The owner unpublishes a resource

- **GIVEN** a resource is published
- **WHEN** the owner unpublishes it
- **THEN** its public address shows not found
- **AND** its published versions are removed

#### Scenario: A stale tab unpublishes an unpublished resource

- **GIVEN** a resource is not published
- **WHEN** a stale tab asks to unpublish it
- **THEN** nothing already stored changes

### Requirement: A versioned address is readable only by its owner

A specific published version SHALL be readable only by the owner, and an anonymous visitor who follows a versioned address SHALL be refused rather than shown the latest publish.

#### Scenario: An anonymous visitor follows a versioned address

- **GIVEN** a visitor holds an address naming a published version
- **WHEN** the visitor is anonymous
- **THEN** the visitor is refused
- **AND** the visitor is not shown the latest publish instead

#### Scenario: The owner opens an earlier published version

- **GIVEN** the owner has published a resource more than once
- **WHEN** the owner opens an earlier version
- **THEN** that version's content is shown

### Requirement: A published page keeps its assets after the originals change

A published page SHALL keep working when the owner later changes or removes the assets its content referenced, because the publish carries its own copies.

#### Scenario: The owner deletes an image after publishing

- **GIVEN** a published page shows an image from the owner's files
- **WHEN** the owner deletes the original image
- **THEN** the published page still shows the image

### Requirement: A publish that finds its copies swept repairs them and reports any failed repair

When a concurrent unpublish removes a publish's copied assets, the publish SHALL copy them again, and a repair that fails SHALL be reported to the owner rather than swallowed.

#### Scenario: An unpublish lands during a publish

- **GIVEN** an unpublish removes the assets a publish has just copied
- **WHEN** the publish completes
- **THEN** the publish copies the assets again so the page's images load

#### Scenario: The repair fails

- **GIVEN** repairing the copied assets fails
- **WHEN** the publish finishes
- **THEN** the owner is told the publish did not fully repair its assets
- **AND** publishing again repairs them

### Requirement: Each publishable type has a public view that unfurls with its name

Each publishable type SHALL have a public view, and a shared published address SHALL show the resource's name when it is pasted into a message or a post.

#### Scenario: A published address is pasted into a message

- **GIVEN** a published address is pasted into a chat message or a post
- **WHEN** the link preview is generated
- **THEN** it shows the resource's name as its title
