## Purpose

One scrollspy for every sidebar that tracks scrolled content — useVisibleSectionIds resolves the anchors, StyledSlideIndicator draws the rail.

## Requirements

### Requirement: Every section on screen is highlighted at once

The sidebar SHALL highlight every section that overlaps the reading area at once, not only the nearest heading.

#### Scenario: Two sections share the screen

- **GIVEN** a page whose sections are listed in a sidebar
- **WHEN** the reading area shows the end of one section and the start of the next
- **THEN** both sections are highlighted in the sidebar
- **AND** the rail stretches across both

### Requirement: The highlight follows what is on screen, not the last click

The sidebar highlight SHALL follow the content that is on screen and SHALL NOT remember which item the reader last clicked.

#### Scenario: Clicking a sidebar item

- **GIVEN** a sidebar listing the sections of a page
- **WHEN** the reader clicks an item
- **THEN** the page scrolls to that section
- **AND** the highlight moves to that section once it is on screen

#### Scenario: Scrolling by hand

- **GIVEN** a sidebar listing the sections of a page
- **WHEN** the reader scrolls the page by hand
- **THEN** the highlight follows the sections that are on screen

### Requirement: The highlight holds when no listed section is on screen

When no listed section is on screen, the sidebar SHALL keep the last highlighted sections rather than clearing them.

#### Scenario: Scrolling through an unlisted gap

- **GIVEN** a page with a stretch of content that no listed section covers
- **WHEN** the reader scrolls into that stretch
- **THEN** the previously highlighted sections stay highlighted

### Requirement: Sections that appear later are found without being reported

A section that appears after the sidebar is shown SHALL be picked up without the sidebar being told about it.

#### Scenario: A panel finishes loading its content

- **GIVEN** a panel whose sections load after the sidebar is shown
- **WHEN** the panel's content appears
- **THEN** its sections become highlightable in the sidebar

#### Scenario: A listed section never appears

- **GIVEN** a sidebar listing a section that does not exist on the page
- **WHEN** the reader scrolls through the page
- **THEN** that item is never highlighted
- **AND** no error is shown

### Requirement: A section scrolled to from the page lands below the sticky top bar

A section that the page scrolls to SHALL land below the page's sticky top bar rather than behind it.

#### Scenario: Following a sidebar link on a narrow screen

- **GIVEN** a narrow screen where a toolbar sticks to the top of the page
- **WHEN** the reader follows a sidebar link to a section
- **THEN** the section's heading is visible below the toolbar

### Requirement: A section inside a scrolling panel is highlighted only while visible in the panel

A section inside a scrolling panel SHALL be highlighted only while it is visible inside that panel.

#### Scenario: A section scrolled above the panel's top edge

- **GIVEN** a sidebar beside a scrolling settings panel
- **WHEN** a section scrolls above the panel's visible top edge
- **THEN** that section is no longer highlighted

### Requirement: The highlight changes only when a section crosses an edge

The sidebar highlight SHALL change only when a section crosses an edge of the reading area, so that a layout shift which moves no section leaves the sidebar unchanged.

#### Scenario: A warning expands above the content

- **GIVEN** a page where the highlighted section stays on screen
- **WHEN** an element above the content expands and moves the content down without any section crossing an edge
- **THEN** the sidebar highlight does not change

### Requirement: One rail slides across every group in a list

Each list SHALL have one rail that slides between its active items, including across group boundaries, rather than restarting at each group.

#### Scenario: Selection moves into the next group

- **GIVEN** a list divided into groups with a rail on its active item
- **WHEN** the active item moves from one group into the next
- **THEN** the rail slides from its current position to the new item
