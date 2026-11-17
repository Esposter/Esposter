## Purpose

The owner's choice of whether search engines list a published webpage, set by a switch in the webpage's Settings blade and answered by a noindex robots directive on the published page.

## Requirements

### Requirement: The owner decides whether search engines list a published webpage

A webpage SHALL take a Show in search results setting that is on until the owner turns it off, and a published webpage with the setting off SHALL tell search engines not to list it.

#### Scenario: A page hidden from search tells crawlers not to list it

- **GIVEN** a published webpage whose published snapshot has Show in search results off
- **WHEN** a crawler requests the page
- **THEN** the page's head carries a noindex robots directive

#### Scenario: A page that is listed carries no robots directive

- **GIVEN** a published webpage with Show in search results on
- **WHEN** a crawler requests the page
- **THEN** the page's head carries no robots directive

#### Scenario: The owner turns search listing off

- **GIVEN** a webpage open in the editor
- **WHEN** the owner turns off Show in search results in the Settings blade
- **THEN** the webpage saves the setting
- **AND** the public page changes only when the owner publishes
