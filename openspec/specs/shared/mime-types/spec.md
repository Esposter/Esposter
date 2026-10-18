## Purpose

Extension and media type lookup in @esposter/shared, over the mime-db dataset — the rewrite of mime-types that replaced the package, with its upstream issues settled one by one.

## Requirements

### Requirement: Lookup names the media type of an extension

The lookup SHALL return the media type that a file extension or a file path's extension names.

#### Scenario: An extension names a media type

- **GIVEN** the extension wav
- **WHEN** a caller looks the extension up
- **THEN** the result is the media type audio/wav

#### Scenario: A path is read by its last segment

- **GIVEN** a path whose last segment ends in .wav, with either posix or Windows separators
- **WHEN** a caller looks the path up
- **THEN** the result is the media type audio/wav

#### Scenario: An unknown extension names no media type

- **GIVEN** an extension that no media type lists
- **WHEN** a caller looks the extension up
- **THEN** the result is false

#### Scenario: An alias that collides with an extension names no media type

- **GIVEN** the alias form, which is not an extension
- **WHEN** a caller looks the alias up
- **THEN** the result is false

### Requirement: An extension claimed by several media types resolves to the highest ranked

The lookup SHALL resolve an extension that several media types list to the one that ranks highest, and SHALL resolve a tie to the type the dataset lists later.

#### Scenario: A video extension resolves to the video media type

- **GIVEN** the extension mp4, which both a video and an application media type list
- **WHEN** a caller looks the extension up
- **THEN** the result is video/mp4

#### Scenario: A specific executable type outranks the generic binary type

- **GIVEN** the extension exe, which a specific type and the generic binary type both list
- **WHEN** a caller looks the extension up
- **THEN** the result is the specific type application/x-msdos-program

### Requirement: Extension returns the first extension a media type lists

The extension lookup SHALL return the first extension that a media type lists in the dataset, and SHALL return false for a media type it does not know.

#### Scenario: A media type returns its first listed extension

- **GIVEN** the media type audio/mp3
- **WHEN** a caller asks for its extension
- **THEN** the result is mp3

#### Scenario: An unknown media type has no extension

- **GIVEN** a media type that the dataset does not list
- **WHEN** a caller asks for its extension
- **THEN** the result is false

### Requirement: Content type carries the charset the dataset gives

The content type lookup SHALL return a media type's full header with the charset the dataset gives it attached, and SHALL attach no charset where the dataset gives none.

#### Scenario: A text-like type carries its charset

- **GIVEN** the media type application/json
- **WHEN** a caller asks for its content type
- **THEN** the header carries the charset UTF-8

#### Scenario: A type the dataset gives no charset has none attached

- **GIVEN** the media type image/svg+xml
- **WHEN** a caller asks for its content type
- **THEN** the header carries no charset

#### Scenario: A parameter that merely contains the word charset does not block the charset

- **GIVEN** a media type whose only parameter is named x-charset
- **WHEN** a caller asks for its content type
- **THEN** the charset is still attached after that parameter

### Requirement: The lookup runs in a browser

The lookup SHALL run in a browser without loading any server-only module.

#### Scenario: A browser caller looks up a type

- **GIVEN** a browser bundle that imports the lookup
- **WHEN** the browser asks for a media type
- **THEN** the answer is returned without a server-only module being required

### Requirement: The dataset is read on first use rather than at import

The lookup SHALL read the media type dataset on first use, so that a bundle which never looks a type up does not include it.

#### Scenario: An unused import adds no dataset

- **GIVEN** a bundle that imports the lookup and never calls it
- **WHEN** the bundle is built
- **THEN** the dataset is not part of the bundle

### Requirement: Media types come from the dataset and are not copied into the repository

The lookup SHALL answer from the dataset's own media types and extensions rather than from a copy kept in the repository.

#### Scenario: An answer follows the dataset

- **GIVEN** an extension that the dataset lists for a media type
- **WHEN** a caller looks the extension up
- **THEN** the answer is the one the dataset gives

### Requirement: Every upstream issue and pull request carries exactly one verdict

The audit of the upstream package SHALL record exactly one verdict for every issue and pull request it reads.

#### Scenario: A reviewer finds the outcome of an upstream issue

- **GIVEN** an issue on the upstream repository
- **WHEN** a reviewer looks the issue up on the audit page
- **THEN** exactly one verdict is recorded for it
