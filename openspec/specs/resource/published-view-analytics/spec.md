## Purpose

Best-effort view counts on public reads, surfaced on the Overview blade — making the invite → view → respond funnel visible.

## Requirements

### Requirement: Public reads are counted as views

The view total of a published resource SHALL rise by one each time a visitor opens its public page.

#### Scenario: Visitor opens a published page

- **GIVEN** a resource is published
- **WHEN** a visitor opens its public page
- **THEN** the owner's view total on the Overview rises by one

### Requirement: Counting never affects the public page

The public page SHALL show its content whether or not the visit was counted.

#### Scenario: Counting fails during a visit

- **GIVEN** recording a view is failing
- **WHEN** a visitor opens the public page
- **THEN** the page shows its content as normal
- **AND** the view is dropped without an error shown to the visitor

### Requirement: Unpublished pages are not counted

A request for the public address of an unpublished resource SHALL NOT add to any view total.

#### Scenario: Visitor opens an unpublished page

- **GIVEN** a resource is not published
- **WHEN** a visitor opens its public address
- **THEN** the visitor sees a not found page
- **AND** no view is added

### Requirement: Only the owner sees the view total

The view total SHALL be visible only to the resource's owner.

#### Scenario: Another user asks for the view total

- **GIVEN** a resource belongs to one user
- **WHEN** a different user asks for its view total
- **THEN** the request is refused

### Requirement: Survey views sit beside its responses

The Overview of a published survey SHALL show its views beside its response count.

#### Scenario: Survey Overview shows the funnel

- **GIVEN** a published survey with views and responses
- **WHEN** the owner opens its Overview
- **THEN** the views and the responses are shown side by side

### Requirement: Views survive delete, restore and republish

The view total SHALL continue unchanged through a delete and restore, and through an unpublish and republish.

#### Scenario: Restore from the recycle bin keeps the count

- **GIVEN** a published resource with recorded views
- **WHEN** the owner deletes it and restores it from the recycle bin
- **THEN** its view total is unchanged

#### Scenario: Republishing continues the same count

- **GIVEN** a resource with recorded views that was unpublished
- **WHEN** the owner publishes it again
- **THEN** its view total continues from where it was

#### Scenario: Purging clears the count

- **GIVEN** a resource with recorded views
- **WHEN** the owner purges it from the recycle bin
- **THEN** its view total is gone

### Requirement: Views are labelled as views, not visitors

The view total SHALL be labelled as views, because it counts reads rather than people.

#### Scenario: Owner reads the count

- **GIVEN** a published resource with views
- **WHEN** the owner reads the Overview
- **THEN** the figure is labelled as views
