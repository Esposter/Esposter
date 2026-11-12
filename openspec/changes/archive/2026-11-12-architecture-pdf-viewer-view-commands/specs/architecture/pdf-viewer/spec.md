## ADDED Requirements

### Requirement: The More menu goes to the first and last page and fits the width

The viewer's More menu SHALL offer First page, Last page and Fit width, with First page unavailable on the first page and Last page unavailable on the last.

#### Scenario: First page goes to page one

- **GIVEN** a document open on its fourth page
- **WHEN** the reader chooses First page
- **THEN** the viewer shows page one
- **AND** the page field reads one

#### Scenario: Last page is unavailable on the last page

- **GIVEN** a document open on its last page
- **WHEN** the reader opens the More menu
- **THEN** Last page is unavailable
- **AND** First page is available

#### Scenario: Fit width scales the pages to the viewer's width

- **GIVEN** a document open at its opening scale
- **WHEN** the reader chooses Fit width
- **THEN** the pages are as wide as the viewer's pages area
- **AND** the zoom readout shows the new percentage
