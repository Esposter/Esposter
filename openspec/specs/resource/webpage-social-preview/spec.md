## Purpose

The Webpage's Settings blade sets the description and share image its published page is unfurled with, over the site's own logo and blurb.

## Requirements

### Requirement: Settings offers a description and a share image

The Settings blade of a webpage SHALL offer a description and a share image for its published page.

#### Scenario: Owner opens Settings

- **GIVEN** a webpage
- **WHEN** the owner opens its Settings blade
- **THEN** a description field and a share image field are offered

### Requirement: The description is capped at 160 characters

The description SHALL NOT be longer than 160 characters.

#### Scenario: Description too long

- **GIVEN** a description longer than 160 characters
- **WHEN** the owner types it
- **THEN** it cannot be saved with more than 160 characters

### Requirement: Settings changes autosave

Changes to the description and the share image SHALL be saved automatically.

#### Scenario: Owner types a description

- **GIVEN** the Settings blade is open
- **WHEN** the owner changes the description
- **THEN** the change is saved without a separate save action

### Requirement: The share image can be removed

The share image field SHALL offer a Remove action that clears the image.

#### Scenario: Owner removes the share image

- **GIVEN** a webpage with a share image
- **WHEN** the owner chooses Remove
- **THEN** the webpage has no share image

### Requirement: Editor saves keep the Settings values

A save from the page editor SHALL keep the description and share image set in Settings.

#### Scenario: Editor save after a Settings change

- **GIVEN** the owner set a description in Settings
- **WHEN** the owner saves from the page editor
- **THEN** the description is still set

### Requirement: A published page unfurls with its own description and image

A published page SHALL show its description and share image when its link is shared, and SHALL fall back to the site's own description and logo for any field left empty.

#### Scenario: Settings filled in

- **GIVEN** a published page with a description and a share image
- **WHEN** its link is shared and unfurled
- **THEN** the unfurl shows that description and image

#### Scenario: Settings left empty

- **GIVEN** a published page with no description and no share image
- **WHEN** its link is shared and unfurled
- **THEN** the unfurl shows the site's own description and logo

### Requirement: A Settings change reaches a shared link only after republishing

A change to Settings SHALL reach a shared link only once the page is published again.

#### Scenario: Change without republishing

- **GIVEN** a published page
- **WHEN** the owner changes its description without publishing
- **THEN** the shared link still unfurls with the earlier description

### Requirement: The published share image survives a working-copy change

The published share image SHALL remain when the owner replaces the image on the working copy.

#### Scenario: Owner replaces the image after publishing

- **GIVEN** a published page with a share image
- **WHEN** the owner replaces the image on the working copy
- **THEN** the published page still unfurls with the image it was published with

### Requirement: The shared link's title is the webpage's name

The title of a shared link SHALL be the webpage's name.

#### Scenario: Shared link unfurls

- **GIVEN** a webpage with a name
- **WHEN** its link is unfurled
- **THEN** the title is the webpage's name
