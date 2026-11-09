## ADDED Requirements

### Requirement: A page takes an enable condition in the Logic tab

The Logic tab SHALL offer a selected page an enable condition beside its visibility condition, written and checked as an element's enable condition is.

#### Scenario: Owner sets an enable condition on a page

- **GIVEN** a survey whose first question is named "a" and whose second page is selected in the Logic tab
- **WHEN** the owner types `{a} = 1` as the page's enable condition
- **THEN** the page's enable condition is `{a} = 1`

#### Scenario: A page's enable condition that does not parse shows its error and saves nothing

- **GIVEN** a page whose enable condition is `{a} = 1`
- **WHEN** the owner changes the enable condition to `{a} =`
- **THEN** the field shows an error
- **AND** the saved enable condition is still `{a} = 1`
