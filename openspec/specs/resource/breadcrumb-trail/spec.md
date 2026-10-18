## Purpose

Breadcrumbs are the Resource Explorer hub plus the pages you actually came through, kept on the browser history entry rather than in the url — the current page is never a crumb, and the close ✕ peels back to the same place the last crumb does. A link lands its visitor on the direct view, with no trail they did not walk.

## Requirements

### Requirement: The breadcrumb shows the pages the visitor came through

The explorer SHALL show a breadcrumb made of the Resource Explorer hub and the pages the visitor actually navigated through, and SHALL NOT show the page they are on as a crumb.

#### Scenario: Drilling in from the list shows the list as a crumb

- **GIVEN** the visitor opens All from the Resource Explorer
- **WHEN** they open a resource from that list
- **THEN** the breadcrumb reads Resource Explorer then All
- **AND** the resource's own name is not repeated as a crumb

#### Scenario: Opening a resource directly shows only the hub

- **GIVEN** the visitor opens a resource from a shared link
- **WHEN** the page loads
- **THEN** the breadcrumb shows only Resource Explorer

#### Scenario: The hub itself shows no crumb

- **GIVEN** the visitor is on the Resource Explorer home page
- **WHEN** the page loads
- **THEN** no breadcrumb is shown

### Requirement: Home is not a crumb

The breadcrumb SHALL NOT include a link to Home, since the logo already goes there on every page.

#### Scenario: No Home crumb on a deep page

- **GIVEN** the visitor is several pages into the explorer
- **WHEN** they look at the breadcrumb
- **THEN** no Home link appears in it

### Requirement: The close control returns to the last crumb

The explorer SHALL send each close control to the page of the last crumb, so one close undoes one level of drilling.

#### Scenario: Closing a resource returns to the list it came from

- **GIVEN** the visitor drilled into a resource from All
- **WHEN** they press close
- **THEN** they land on All

#### Scenario: Closing a directly opened resource returns to the hub

- **GIVEN** the visitor opened a resource directly
- **WHEN** they press close
- **THEN** they land on the Resource Explorer home page

### Requirement: The trail survives reload and back and forward without being in the address

The explorer SHALL keep the breadcrumb through a reload and through back and forward navigation, and SHALL NOT put the trail in the address.

#### Scenario: A reload keeps the breadcrumb

- **GIVEN** the visitor is on a resource opened from All
- **WHEN** they reload the page
- **THEN** the breadcrumb still reads Resource Explorer then All

#### Scenario: Going back restores the earlier trail

- **GIVEN** the visitor drilled from All into a resource
- **WHEN** they press the browser's back button
- **THEN** the breadcrumb matches the page they returned to

#### Scenario: The address does not carry the trail

- **GIVEN** the visitor is on a drilled-in resource
- **WHEN** they copy the address
- **THEN** the address is the resource's own address with no trail in it

### Requirement: Filter, sort and page changes keep the trail

The explorer SHALL keep the existing breadcrumb when a visitor changes a filter, sort or page on a list.

#### Scenario: Changing a filter does not add a crumb

- **GIVEN** the visitor is on All
- **WHEN** they change a filter or sort
- **THEN** the breadcrumb is unchanged

### Requirement: Leaving the explorer resets the trail

The explorer SHALL clear the breadcrumb when the visitor leaves the explorer or returns to its home page.

#### Scenario: Returning to the explorer home clears the trail

- **GIVEN** the visitor has a drilled-in trail
- **WHEN** they return to the Resource Explorer home page
- **THEN** the breadcrumb is empty

### Requirement: A typed address starts a new trail

The explorer SHALL treat an address typed into the browser as a new visit with no trail, even within a tab that was already on a list.

#### Scenario: Pasting a resource address ignores earlier crumbs

- **GIVEN** the visitor is on All in a tab
- **WHEN** they paste a resource address into the address bar
- **THEN** the resource page shows only the hub crumb

### Requirement: A breadcrumb shows only pages that still exist

The explorer SHALL drop any recorded crumb that no longer names a page it can show, rather than showing a link to nowhere.

#### Scenario: An outdated recorded crumb is dropped

- **GIVEN** a recorded trail names a page the explorer no longer has
- **WHEN** the page loads
- **THEN** that crumb is not shown

### Requirement: A page does not name its own ancestor

The explorer SHALL NOT give a page a fixed crumb for a parent it was not reached from.

#### Scenario: The recycle bin shows the trail it was reached through

- **GIVEN** the visitor opens the recycle bin from the hub
- **WHEN** the page loads
- **THEN** the breadcrumb reads Resource Explorer only
- **AND** no All crumb is shown unless the visitor came through All
