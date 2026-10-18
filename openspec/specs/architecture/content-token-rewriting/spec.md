## Purpose

Finding and rewriting tokens inside authored content — self-delimiting matches, one pass keyed by a map, and convergence on read instead of a backfill.

## Requirements

### Requirement: A token is replaced only where its end is known

A token found in authored content SHALL be replaced only where its own delimiters, or the delimiter that opens it, show where the token ends.

#### Scenario: A name that begins another name is not cut short

- **GIVEN** a document uses one name and a longer name that begins with it
- **WHEN** the tokens are rewritten
- **THEN** each name is replaced in full
- **AND** the longer name is not cut short

#### Scenario: A token inside markup changes only the token

- **GIVEN** a token sits inside an attribute value of a page
- **WHEN** the content is rewritten
- **THEN** only the token's text changes
- **AND** the markup around it is unchanged

### Requirement: Tokens are replaced only inside text values

Tokens SHALL be replaced only inside the text values of a document, so the document's structure and its non-text values come through unchanged.

#### Scenario: Numbers, dates and nesting are unchanged by a rewrite

- **GIVEN** a document holds numbers, dates and nested lists beside a token
- **WHEN** the document is rewritten
- **THEN** the numbers, dates and nesting are unchanged

#### Scenario: A whole text value that is a token is replaced by its target

- **GIVEN** an entire text value is a token
- **WHEN** the document is rewritten
- **THEN** the value is replaced by the token's target

### Requirement: Content converges to a changed token form on read

When the canonical form of a token changes, content SHALL converge to the new form as it is read, with no migration over stored content.

#### Scenario: A reader sees the new form of content stored in the old form

- **GIVEN** content is stored with the old form of a token
- **WHEN** a reader opens the content
- **THEN** the reader sees the new form of the token

#### Scenario: A changed token form ships without a backfill

- **GIVEN** a change to the canonical form of a token is released
- **WHEN** the release is deployed
- **THEN** no backfill over stored content is needed for existing content to display correctly

### Requirement: A token that resolves to nothing is left as written

A token that resolves to nothing SHALL be left exactly as written and SHALL NOT fail the save, publish or read of its document.

#### Scenario: A link with invalid escapes survives publishing

- **GIVEN** a hand-typed link has invalid percent escapes
- **WHEN** the document is published
- **THEN** the link is kept as typed
- **AND** the publish succeeds

#### Scenario: A merge field naming a missing key still produces the message

- **GIVEN** a merge field names a key the recipient's data does not have
- **WHEN** the message is personalized
- **THEN** the field's text is left in place
- **AND** the message is still produced
