# architecture/ai-native-resources/in-product-assistant Specification

## Purpose

A person working in a resource editor can ask an agent for an edit without leaving it. Ask Claude composes the prompt, which the person carries to the agent they already run; that agent edits through the same tools any agent uses, under the person's own key, so asking from inside the editor opens no second way in.

## Requirements

### Requirement: Ask Claude is offered in every resource type's editor

The editor of every resource type SHALL offer an Ask Claude command in its toolbar and in the command palette.

#### Scenario: Ask Claude is available in any type's editor

- **GIVEN** a person has a resource of any type open
- **WHEN** the person opens the command palette or looks at the toolbar
- **THEN** Ask Claude is offered
- **AND** choosing it opens a line for the person to type

### Requirement: A typed line becomes a prompt the person can copy

Ask Claude SHALL turn the person's line into a prompt that names the resource by its id and type, and offer it for copying.

#### Scenario: The prompt names the resource

- **GIVEN** the person holds a key with the Resources scope
- **WHEN** the person types a line
- **THEN** a prompt containing the line and the resource's id and type is offered for copying

#### Scenario: No prompt is offered before there is a line

- **GIVEN** the person holds a key with the Resources scope
- **WHEN** the person opens Ask Claude and has typed nothing
- **THEN** no prompt is offered

### Requirement: The agent edits with the person's own key

The agent SHALL reach the resource with the person's own key, so its edits are limited by that key's scopes and rate limits and are recorded in the activity under that key.

#### Scenario: An assistant edit is recorded under the person's key

- **GIVEN** the agent has saved an edit to a resource
- **WHEN** the person reads the resource's activity
- **THEN** the edit is listed under the name of the key that made it

#### Scenario: A key without the Resources scope cannot edit

- **GIVEN** the person's key does not hold the Resources scope
- **WHEN** the agent asks to edit the resource
- **THEN** the edit is refused
- **AND** the resource is unchanged

#### Scenario: The steps to connect a key are shown when none holds the scope

- **GIVEN** the person has no key holding the Resources scope
- **WHEN** the person opens Ask Claude
- **THEN** the command shows the steps to connect a key
- **AND** no prompt is offered

### Requirement: An assistant edit reaches the open editor without a reload

The open editor SHALL show an edit the agent saves as it arrives, and SHALL offer the person a choice rather than overwrite an edit they have not saved.

#### Scenario: An edit arrives in an editor with nothing unsaved

- **GIVEN** the editor has no unsaved edit
- **WHEN** the agent saves an edit to the resource
- **THEN** the editor shows the saved edit without a reload

#### Scenario: An edit arriving over an unsaved edit is offered as a choice

- **GIVEN** the person has an unsaved edit in the editor
- **WHEN** the agent saves an edit to the resource
- **THEN** the person is offered a choice between the saved edit and their own
- **AND** the person's unsaved edit stays on screen until they choose

### Requirement: Ask Claude calls no model and charges nothing

Esposter SHALL NOT call a model for Ask Claude or meter any charge for it.

#### Scenario: A line becomes a prompt without a model call

- **GIVEN** the person types a line in Ask Claude
- **WHEN** the prompt is composed
- **THEN** Esposter calls no model
- **AND** Esposter records no usage and charges nothing
