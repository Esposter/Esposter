## ADDED Requirements

### Requirement: A browser without WebGPU downloads nothing

The page SHALL tell a browser without a usable WebGPU adapter that Image Studio needs one, and offer no download.

#### Scenario: A browser without WebGPU sees the unsupported notice

- **GIVEN** a browser with no WebGPU adapter
- **WHEN** the page opens
- **THEN** the page shows the unsupported notice naming the browsers that run it
- **AND** no download button is shown

### Requirement: A model downloads only after the user confirms its cost

The page SHALL start a model's download only after the user confirms a dialog showing its download size, the free space, a time estimate and its licence.

#### Scenario: Opening the page downloads no model

- **GIVEN** a browser with WebGPU and no model held
- **WHEN** the page opens
- **THEN** no model file is requested
- **AND** the model's download button names its size

#### Scenario: The confirmation dialog states the download's cost

- **WHEN** the user presses a model's download button
- **THEN** a dialog shows the model's download size, the free space, a time estimate and the model's licence
- **AND** no model file is requested until the user confirms it

#### Scenario: Dismissing the confirmation downloads nothing

- **GIVEN** the confirmation dialog is open
- **WHEN** the user dismisses it
- **THEN** no model file is requested

#### Scenario: A device without room for the model cannot confirm

- **GIVEN** a device whose free space is smaller than the model
- **WHEN** the confirmation dialog opens
- **THEN** its confirm button is disabled
- **AND** the dialog states how much space is missing

### Requirement: A confirmed download shows its progress and can be cancelled

The page SHALL show a confirmed download's bytes held, its total and its time left, and stop it when the user cancels.

#### Scenario: A download shows its progress

- **GIVEN** the user confirmed a model's download
- **WHEN** a file of the model finishes
- **THEN** the progress bar shows the bytes held out of the total and the time left

#### Scenario: Cancelling a download stops it

- **GIVEN** a download in progress
- **WHEN** the user cancels it
- **THEN** no further model file is requested
- **AND** the model's download button shows the size still to download

### Requirement: A downloaded model is downloaded once

The page SHALL load a model whose files are all held from the device, and fetch only the files missing when a download was interrupted.

#### Scenario: A second visit loads the model without downloading it

- **GIVEN** a model whose files are all held
- **WHEN** the page opens
- **THEN** the model loads with no model file requested

#### Scenario: An interrupted download fetches only the files it is missing

- **GIVEN** a model with some of its files held
- **WHEN** the user confirms its download
- **THEN** only the files not held are requested
