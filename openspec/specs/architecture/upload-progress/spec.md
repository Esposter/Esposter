## Purpose

How a block upload's progress is counted in place of p-progress, and the verdict on each upstream p-progress issue. The counting is the upload's own, and the upstream verdicts are recorded so that no issue is left unread.

## Requirements

### Requirement: Upload progress is the share of blocks that have landed

The upload SHALL report its progress as the share of its blocks that have landed.

#### Scenario: Progress rises with each landed block

- **GIVEN** a file split into several blocks is uploading
- **WHEN** each block lands
- **THEN** the reported progress is the number of landed blocks over the total number of blocks
- **AND** the reported progress never goes down

### Requirement: A refused block fails the upload without discarding the blocks around it

A refused block SHALL fail the upload, while the blocks that landed around it still count toward progress.

#### Scenario: A refused block fails the upload

- **GIVEN** the blocks of a file are uploading
- **WHEN** one block is refused
- **THEN** the upload fails
- **AND** the blocks that landed before and after the refused block still count toward progress

### Requirement: An empty file reports complete progress and nothing else

An empty file SHALL report complete progress and no other progress.

#### Scenario: An empty file completes at once

- **GIVEN** a file with no content is uploading
- **WHEN** its upload runs
- **THEN** the only progress reported is complete
