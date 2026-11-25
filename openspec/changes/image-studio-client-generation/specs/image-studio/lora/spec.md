## ADDED Requirements

### Requirement: An uploaded LoRA applies on the device

The page SHALL apply a LoRA file the user adds to the next image at its chosen strength, without sending the file anywhere.

#### Scenario: A LoRA fills the model's slots at its strength

- **GIVEN** a LoRA file whose keys all map to the model's slots
- **WHEN** it is added at a strength of one half
- **THEN** each mapped slot holds the LoRA's down and up matrices
- **AND** the slots' scale is one half

#### Scenario: Adding a LoRA sends no request

- **WHEN** the user adds a LoRA file
- **THEN** no network request is made

### Requirement: Keys a model cannot take are reported

The page SHALL list every key of a LoRA file that maps to no slot of the model, and refuse a file none of whose keys map.

#### Scenario: A text-encoder LoRA's keys are reported as skipped

- **GIVEN** a LoRA file holding denoiser keys and text-encoder keys
- **WHEN** it is added
- **THEN** its denoiser keys fill their slots
- **AND** its text-encoder keys are listed as skipped

#### Scenario: A LoRA for another model is refused

- **GIVEN** a LoRA file none of whose keys map to the model's slots
- **WHEN** it is added
- **THEN** the file is refused with a message saying it was made for another model
- **AND** no slot changes

### Requirement: Several LoRAs combine within the slot's rank

The page SHALL combine several LoRAs by summing each one's change to a layer at its strength and truncating the sum to the slot's rank.

#### Scenario: Two LoRAs apply together

- **GIVEN** two LoRAs whose changes to one layer sum to a rank no larger than the slot's
- **WHEN** both are added
- **THEN** the slot's product equals the sum of each LoRA's change at its strength

#### Scenario: A combination over the slot's rank keeps its largest components

- **GIVEN** two LoRAs whose changes to one layer sum to a rank larger than the slot's
- **WHEN** both are added
- **THEN** the slot holds the sum's largest components up to the slot's rank
- **AND** the LoRA panel says the combination was truncated
