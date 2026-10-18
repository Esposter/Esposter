## Purpose

The shared chrome primitives — page header, breadcrumbs, empty/loading states, and the launcher — that make the platform read as one product.

## Requirements

### Requirement: Breadcrumbs show the path the visitor came through

The breadcrumb trail SHALL show the area hub followed by the pages the visitor came through, and SHALL NOT show the page they are on.

#### Scenario: Direct arrival on a page

- **GIVEN** the visitor opens a page directly by its address
- **WHEN** the breadcrumb trail is shown
- **THEN** it shows the area hub so the visitor has a way out

#### Scenario: Visitor navigated through pages

- **GIVEN** the visitor opened a list and then a resource from it
- **WHEN** the breadcrumb trail is shown on the resource
- **THEN** it shows the area hub and the list
- **AND** it does not show the resource itself

### Requirement: The persistent readout sits at the end of the breadcrumb trail

A persistent readout SHALL sit at the far end of the breadcrumb trail, and SHALL move to its own line when the row cannot hold both.

#### Scenario: Narrow window

- **GIVEN** the breadcrumb trail is too long for the row beside the readout
- **WHEN** the owner views the page
- **THEN** the readout is shown on its own line beneath the trail

### Requirement: Empty states show a mark, a title and at most one action

An empty state SHALL show a mark, a title, an optional description, and at most one action.

#### Scenario: No resources yet

- **GIVEN** the owner has no resources
- **WHEN** the owner opens the Resource Explorer
- **THEN** an empty state shows a mark, a title and one action

### Requirement: A failed read shows an error state with a retry

A failed read SHALL show an error state with a retry action.

#### Scenario: A list fails to load

- **GIVEN** the list of resources cannot be read
- **WHEN** the owner views the list
- **THEN** an error state is shown with a Retry action

### Requirement: A loading region shows a placeholder of its own size

A region that is loading SHALL show a placeholder of its own size rather than the whole page loading indicator.

#### Scenario: One region loads while the page is shown

- **GIVEN** one region of a page is still loading
- **WHEN** the owner views the page
- **THEN** that region shows a placeholder
- **AND** the rest of the page is shown as usual

### Requirement: The launcher shows one Resource Explorer entry

The launcher SHALL show one Resource Explorer entry covering every resource type.

#### Scenario: Owner opens the launcher

- **GIVEN** the owner opens the launcher
- **WHEN** the owner looks for resources
- **THEN** one Resource Explorer entry is shown

### Requirement: The launcher groups products by what they are for

The launcher SHALL group products by what they are for, with Clicker and Dungeons in the Play group.

#### Scenario: Owner browses the launcher

- **GIVEN** the owner opens the launcher
- **WHEN** the owner reads the groups
- **THEN** Clicker and Dungeons appear in a Play group

### Requirement: Every resource page shows its trail, title and sections in one header

Every resource page SHALL show its breadcrumb trail, its title and its sections as tab links in one page header.

#### Scenario: Owner opens a resource page

- **GIVEN** the owner opens a resource
- **WHEN** the page loads
- **THEN** the breadcrumb trail, the title and the section tabs are shown in one header
