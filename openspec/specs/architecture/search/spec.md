## Purpose

One search stack — the command palette's scopes, useAutoSearch/useCursorSearcher for server search-as-you-type, MiniSearch for client-index search, and the three sanctioned exceptions.

## Requirements

### Requirement: Server search sends at most one request per second while typing

A search that needs the server SHALL send at most one request per second while the reader is typing.

#### Scenario: Quick typing sends one request

- **GIVEN** a search box that queries the server
- **WHEN** the reader types several letters within one second
- **THEN** at most one request is sent for that second

### Requirement: A newer query cancels the older request silently

A search that receives a newer query SHALL cancel the request still in flight and stay silent about the cancelled request.

#### Scenario: A newer query arrives while a request is pending

- **GIVEN** a search request that has not yet returned
- **WHEN** the reader types a newer query
- **THEN** the pending request is cancelled
- **AND** its results never replace the results of the newer query
- **AND** no error is shown for the cancelled request

### Requirement: An unchanged query is not searched again

A search SHALL NOT send a new request when the normalized query matches the query already searched.

#### Scenario: Adding surrounding spaces to the same words

- **GIVEN** a search that has already searched for a set of words
- **WHEN** the reader adds surrounding spaces without changing the words
- **THEN** no new request is sent

### Requirement: Emptying the query clears the results

A search SHALL clear its results and cancel any pending request when the reader empties the query.

#### Scenario: Clearing the search box

- **GIVEN** a search with results on screen and a request still pending
- **WHEN** the reader clears the search box
- **THEN** the results are cleared
- **AND** the pending request is cancelled

### Requirement: A picker that lists everything keeps its full list on an empty query

A picker that lists everything for an empty query SHALL keep its full list when the query is cleared.

#### Scenario: Clearing a picker's query

- **GIVEN** a picker that lists every item when its query is empty
- **WHEN** the reader clears the query
- **THEN** the full list is shown rather than an empty result

### Requirement: A failed search shows its error to the reader

A search whose request fails SHALL show the error message to the reader as an alert.

#### Scenario: The server rejects a search

- **GIVEN** a search that the server rejects with an error message
- **WHEN** the search runs
- **THEN** the reader sees that error message as an alert

### Requirement: A search reports its own pending state

A search SHALL report whether it is pending so that its progress indicator needs no search flag kept by the consumer.

#### Scenario: A search in flight shows progress

- **GIVEN** a search that has sent a request
- **WHEN** the request has not yet returned
- **THEN** the progress indicator is shown
- **AND** it is hidden once the request has returned

### Requirement: A paginated search loads further pages on scroll

A search whose results paginate SHALL load the next page when the reader reaches the end of the list.

#### Scenario: Reaching the end of a room picker

- **GIVEN** a room picker with more matching results than are shown
- **WHEN** the reader scrolls to the end of the list
- **THEN** the next page of results is loaded
- **AND** the current search query is kept

### Requirement: Data already on the page is searched without a server request

A search over data already loaded on the page SHALL answer as the reader types without sending a server request.

#### Scenario: Typing the start of a word

- **GIVEN** a search over loaded entries
- **WHEN** the reader types the start of a word
- **THEN** entries containing a word that starts with those letters appear
- **AND** no server request is sent

#### Scenario: Every typed word must match

- **GIVEN** a search over loaded entries
- **WHEN** the reader types two words
- **THEN** only entries that match both words appear

#### Scenario: An exact shortcode is listed first

- **GIVEN** a search over entries that each have a canonical shortcode
- **WHEN** the reader types a shortcode exactly
- **THEN** the entry with that shortcode is listed first

### Requirement: Filtering by typed characters matches inside words

Filtering a list by typed characters SHALL match them as a plain substring, so that a term inside a longer word still matches.

#### Scenario: A filter finds a term inside a longer word

- **GIVEN** a log filtered by typed characters
- **WHEN** the reader types Error into the filter
- **THEN** lines containing TypeError match

### Requirement: New search-as-you-type features use the shared search lifecycle

A feature that searches the server as the reader types SHALL take its throttling, cancellation and pending state from the shared search lifecycle and SHALL NOT keep its own copy.

#### Scenario: A feature hand-rolls its own throttle

- **GIVEN** a change that adds server search-as-you-type with its own throttle and cancellation
- **WHEN** the change is reviewed
- **THEN** the throttle and cancellation are moved onto the shared search lifecycle before it is accepted

### Requirement: One command palette opened with Ctrl+K

There SHALL be one command palette, opened with Ctrl+K, that a surface's own search feeds as a scope instead of through a dialog of its own.

#### Scenario: Opening the palette on a page with a search scope

- **GIVEN** a page that has handed its search to the palette as a scope
- **WHEN** the reader presses Ctrl+K
- **THEN** the palette opens showing that scope's results

#### Scenario: A scope ends with its surface

- **GIVEN** a surface that has handed its search to the palette
- **WHEN** the reader leaves that surface
- **THEN** the palette no longer shows that surface's results
