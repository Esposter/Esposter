## ADDED Requirements

### Requirement: Every stored webpage and email parses under its typed schema

A webpage or an email the editors have stored SHALL parse under the schema its type builds from its registry, so the typed schema refuses only what the editors would never store.

#### Scenario: A stored webpage parses under the typed schema

- **GIVEN** a webpage holding a node of every webpage type, each with the props the editor stores
- **WHEN** the webpage is parsed against its document schema
- **THEN** the webpage parses without a refusal

#### Scenario: A stored email parses under the typed schema

- **GIVEN** an email holding a node of every email type, each with the props the editor stores, and a merge field in a text node
- **WHEN** the email is parsed against its document schema
- **THEN** the email parses without a refusal
