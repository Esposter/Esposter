## ADDED Requirements

### Requirement: A prompt becomes an image on the device

The page SHALL turn a prompt, a seed, a size and a step count into an image on the device, sending no request that carries the prompt.

#### Scenario: A prompt becomes an image

- **GIVEN** a loaded model
- **WHEN** the user generates from a prompt
- **THEN** the pipeline runs the text encoder once, the denoiser once per step and the decoder once
- **AND** an image of the chosen size is shown

#### Scenario: Generating sends no request

- **GIVEN** a loaded model
- **WHEN** the user generates from a prompt
- **THEN** no network request is made

### Requirement: A generation can be cancelled between steps

The pipeline SHALL stop a cancelled generation before its next denoising step and produce no image.

#### Scenario: Cancelling stops the generation before its next step

- **GIVEN** a generation of eight steps
- **WHEN** the user cancels it during its third step
- **THEN** no fourth step runs
- **AND** no image is shown

### Requirement: A generation the GPU cannot hold fails with a way forward

The page SHALL fail a generation whose GPU device is lost or whose allocation is refused with a message suggesting a smaller size or low-memory mode, and the next generation SHALL run on new sessions.

#### Scenario: A lost GPU device fails the generation with a message

- **GIVEN** a generation in progress
- **WHEN** the GPU device is lost
- **THEN** the page shows a message suggesting a smaller size or low-memory mode
- **AND** the next generation creates its sessions again

### Requirement: A saved image carries its settings

A saved image SHALL carry its prompt, seed, size, steps, model and each LoRA's name and strength in the file.

#### Scenario: A saved image carries its settings

- **GIVEN** an image generated with one LoRA at a strength of one half
- **WHEN** the user saves it
- **THEN** the PNG's text chunk holds the prompt, the seed, the size, the steps, the model, and the LoRA's file name with its strength
