## ADDED Requirements

### Requirement: A list is read a page at a time from a cursor

A paginated read SHALL answer at most the page size it is asked for, in its declared order, with a cursor that continues from the last item it answered, and an empty cursor when no item is left.

#### Scenario: Reading a list to its end

- **GIVEN** a list longer than one page
- **WHEN** the reader reads page after page, each from the cursor the last one answered
- **THEN** every item is answered exactly once, in order
- **AND** the last page answers an empty cursor

#### Scenario: Items that tie on the sort

- **GIVEN** several items that share the value the list is sorted by, falling across a page boundary
- **WHEN** the reader reads past that boundary
- **THEN** none of the tied items is skipped or answered twice

#### Scenario: A list that changes while it is read

- **GIVEN** a reader part way through a list
- **WHEN** an item already read is removed, or a new item is added at the start
- **THEN** the next page continues after the last item read, skipping and repeating nothing

#### Scenario: A malformed cursor

- **GIVEN** a cursor that the server did not issue, or one issued for another list
- **WHEN** a read is asked with it
- **THEN** the read is refused as a bad request

### Requirement: A list's order is the server's

A paginated read SHALL order its items by a sort the server declares, and a reader SHALL only choose among the sorts a list offers by name.

#### Scenario: Choosing an offered sort

- **GIVEN** a list that offers a newest and a top sort
- **WHEN** the reader asks for the top sort
- **THEN** the list is answered in that order

#### Scenario: Asking for a sort the list does not offer

- **GIVEN** a list with one order
- **WHEN** a read names any other order
- **THEN** the read is refused as a bad request

### Requirement: A page size is bounded

A paginated read SHALL refuse a page size larger than the app's ceiling.

#### Scenario: Too large a page

- **WHEN** a read asks for more items than the ceiling
- **THEN** the read is refused as a bad request

### Requirement: A total is answered with the page

A list whose surface shows how many items it holds SHALL answer that count with its first page.

#### Scenario: A search shows how many results it found

- **WHEN** the reader searches
- **THEN** the first page carries the number of results

### Requirement: A list read around a point reads both ways

A list the reader opens at one of its items SHALL answer the items around it with a cursor in each direction.

#### Scenario: Jumping to an old message

- **GIVEN** a room whose message the reader follows a link to, far back in its history
- **WHEN** the room opens at that message
- **THEN** the messages before and after it are shown
- **AND** the reader can scroll further in either direction

### Requirement: The newest read of a list wins

The client SHALL keep the page of the newest read of a list, and SHALL drop the answer of a read that a newer read of the same list replaced.

#### Scenario: Typing a new search while the last one loads more

- **GIVEN** a search whose next page is loading
- **WHEN** the reader changes the search
- **THEN** the late page of the old search is not added to the new search's results
