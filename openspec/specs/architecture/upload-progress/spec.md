## Purpose

How an upload's progress is counted, and the verdict on each upstream p-progress issue. The counting is the upload's own, and the upstream verdicts are recorded so that no issue is left unread.

## Requirements

### Requirement: Upload progress is the share of bytes sent

The upload SHALL report its progress as the share of its bytes the browser has sent.

#### Scenario: Progress rises as bytes are sent

- **GIVEN** a file is uploading
- **WHEN** bytes are sent
- **THEN** the reported progress is the bytes sent over the file's total bytes
- **AND** the reported progress never goes down

### Requirement: A refused upload fails after the other uploads in its batch stop

A refused upload SHALL fail, and the failure SHALL be reported only once every other upload in its batch has stopped writing.

#### Scenario: A refused upload in a batch

- **GIVEN** several files in one batch are uploading
- **WHEN** one file's upload is refused
- **THEN** the other uploads in the batch finish writing before the batch fails
- **AND** the batch fails with the refused upload's error

### Requirement: An empty file reports complete progress and nothing else

An empty file SHALL report complete progress and no other progress.

#### Scenario: An empty file completes at once

- **GIVEN** a file with no content is uploading
- **WHEN** its upload runs
- **THEN** the only progress reported is complete
