## Purpose

The app's own UI library on Vuetify 0's headless primitives — three layers and the import boundary that keeps Vuetify 0 inside the library, one owner per concern, icons as CSS generated per use, the component catalogue with the contract every component keeps and its keyboard contracts, the app shell with its dock, toasts and dialogs, the generated map of how the pages link, and the agent tooling installed with it. The requirements cover the library's commitments to its users, and leave the product's own page and component designs to their owning specs.

## Requirements

### Requirement: Features build only from the app's own UI library

A feature SHALL build its interface only from the app's own UI library and SHALL NOT import the headless primitives that library is built on.

#### Scenario: A feature that imports a headless primitive directly is refused

- **GIVEN** a feature component in the app
- **WHEN** it imports a headless primitive directly
- **THEN** the lint check refuses the change

### Requirement: Components take their colours, type and edges from design tokens

A library component SHALL take its colours, type and edges from the design tokens and SHALL NOT hold a colour of its own.

#### Scenario: A design style change needs no component edit

- **GIVEN** every component draws from the design tokens
- **WHEN** the palette changes or a design style is added
- **THEN** no component is edited
- **AND** every component draws in the new look

### Requirement: Each interface concern has exactly one owner

Each interface concern SHALL be decided in exactly one place, covering the selected theme, the breakpoints, the hotkeys, the validation rules and the dates.

#### Scenario: A change to a concern is made in its one owner

- **GIVEN** a concern such as the selected theme
- **WHEN** the concern's behaviour changes
- **THEN** the change is made in its owner
- **AND** no other part of the app answers that question separately

### Requirement: Icons are chosen by meaning

An icon SHALL be chosen by what it says, and the icon set drawing each meaning SHALL change without any feature naming a set.

#### Scenario: A design style swaps the icon set behind every meaning

- **GIVEN** a feature shows a success mark
- **WHEN** the design style changes its icon set
- **THEN** the feature shows the new set's glyph for success
- **AND** the feature is unedited

#### Scenario: A meaning with no glyph in the active set falls back to a glyph of its own

- **GIVEN** the active icon set has no glyph for a meaning
- **WHEN** an icon of that meaning is drawn
- **THEN** a fallback glyph is drawn in its place

### Requirement: Icon names are written in full in source

An icon SHALL be named in full in source, because an icon assembled from parts is not drawn.

#### Scenario: A source file naming an icon that cannot be drawn fails the suite

- **GIVEN** a source file names an icon
- **WHEN** the suite checks every icon named in source
- **THEN** the suite fails when the icon cannot be drawn
- **AND** a plain script file that names an icon must declare that it does

### Requirement: An icon is hidden from assistive technology unless it is labelled

An icon SHALL be hidden from assistive technology unless it carries a label that names what it says.

#### Scenario: An unlabelled icon beside text is skipped

- **GIVEN** an icon sits beside text that already says what it means
- **WHEN** a screen reader reads the page
- **THEN** the icon is skipped

#### Scenario: A labelled icon is announced by its label

- **GIVEN** a status icon carries a label
- **WHEN** a screen reader reads it
- **THEN** it is announced by that label

### Requirement: Every component keeps one contract

Every library component SHALL take its behaviour from its headless primitive, take its props in the library's own words, and require a label wherever it has no visible text.

#### Scenario: An icon-only control written without a label fails the typecheck

- **GIVEN** an icon-only button
- **WHEN** it is written without a label
- **THEN** the typecheck fails

#### Scenario: A call site's attributes win over the primitive's

- **GIVEN** a button written with a submit type at its call site
- **WHEN** the button renders
- **THEN** the call site's submit type is kept

### Requirement: Menus open and walk from the keyboard

A menu SHALL open onto its first item from a click, Enter, Space or the down arrow, and SHALL walk its items with the arrow keys, Home, End and typing.

#### Scenario: The up arrow opens a menu onto its last item

- **GIVEN** a closed menu with focus on its trigger
- **WHEN** the reader presses the up arrow
- **THEN** the menu opens onto its last item

#### Scenario: A disabled item is reached but never picked

- **GIVEN** a menu holds a disabled item
- **WHEN** the reader arrows onto it and presses Enter
- **THEN** the item is announced as disabled
- **AND** the item is not picked

#### Scenario: Typing a title's first letters moves to the next matching title

- **GIVEN** an open menu holds several titles that begin with the same letter
- **WHEN** the reader types a title's first letters and then pauses
- **THEN** focus moves to the next title beginning with them

#### Scenario: A pick or Escape returns focus to the trigger

- **GIVEN** a menu is open
- **WHEN** the reader picks an item or presses Escape
- **THEN** the menu closes with focus back on its trigger
- **AND** Tab closes the menu and moves focus onward

### Requirement: Selects and suggestions keep focus where the reader types or chooses

A suggestion list SHALL keep focus in its field, and a select SHALL keep focus on its trigger, while the reader moves through its options.

#### Scenario: Enter with no suggestion highlighted is left to the field

- **GIVEN** suggestions are showing and none is highlighted
- **WHEN** the reader presses Enter in the field
- **THEN** the field's own action runs

#### Scenario: Escape dismisses suggestions without reaching page shortcuts

- **GIVEN** suggestions are showing in a field
- **WHEN** the reader presses Escape
- **THEN** the suggestions close
- **AND** the key does not reach any page shortcut
- **AND** the next keystroke in the field brings the suggestions back

#### Scenario: A multi-select stays open while the reader picks

- **GIVEN** a select is bound to several options
- **WHEN** the reader presses Enter on options
- **THEN** each press toggles the highlighted option
- **AND** the list stays open until Escape, Tab or the trigger closes it

### Requirement: Dialogs keep focus inside and close predictably

A dialog SHALL keep focus inside itself while it is open, and SHALL close on Escape or on a click on its scrim.

#### Scenario: A dialog opens on the control marked to autofocus

- **GIVEN** a dialog holds a control marked to autofocus
- **WHEN** the dialog opens
- **THEN** focus lands on that control
- **AND** without such a control, focus lands on the dialog itself

#### Scenario: A failed destructive answer leaves the confirmation open

- **GIVEN** a confirmation's destructive answer is under way
- **WHEN** the answer fails
- **THEN** the dialog stays open so the reader can try again
- **AND** the destructive answer is disabled while the answer is under way

#### Scenario: A guarded deletion enables its answer only for the exact name

- **GIVEN** a guarded confirmation shows the name of what it destroys
- **WHEN** the reader types a name that differs from it
- **THEN** the destructive answer stays disabled

#### Scenario: A guarded deletion enables its answer once the name matches exactly

- **GIVEN** a guarded confirmation shows the name of what it destroys
- **WHEN** the reader types that name exactly
- **THEN** the destructive answer is enabled

### Requirement: Panels close alone and never close one another

A popover SHALL close on Escape with focus back on its trigger, and SHALL NOT close another panel that is open beside it.

#### Scenario: A date popover inside a filter closes alone

- **GIVEN** a date popover is open inside a filter panel
- **WHEN** the reader presses Escape
- **THEN** only the date popover closes

#### Scenario: A tooltip opens beside an open panel without closing it

- **GIVEN** a dock panel is open
- **WHEN** the reader hovers another dock button that has a tooltip
- **THEN** the open panel stays open
- **AND** the tooltip shows beside the panel, never over it

#### Scenario: A popover hung off a row returns focus to that row

- **GIVEN** a list row has been pressed
- **WHEN** a popover opens against that row
- **THEN** the popover anchors to the row
- **AND** closing it returns focus to the row

### Requirement: Lists and tables reorder by drag or by keyboard

A reorderable list or table SHALL move a row by drag or by Alt with the up and down arrows, and SHALL emit the new order without applying it.

#### Scenario: A keyboard move is read out

- **GIVEN** a row in a reorderable list is focused
- **WHEN** the reader presses Alt with the down arrow
- **THEN** the row moves one place
- **AND** focus stays on the row
- **AND** the new position is announced

#### Scenario: Reordering is off while a table is sorted, searched or grouped

- **GIVEN** a table is sorted, searched or grouped
- **WHEN** the reader attempts to drag a row
- **THEN** no row moves

#### Scenario: A touch drag waits for a short rest so a swipe scrolls

- **GIVEN** the reader is on a touch screen
- **WHEN** the reader presses a row and holds it briefly
- **THEN** the drag starts only after the short delay
- **AND** a swipe scrolls the page instead

### Requirement: Grids and calendars move one cell or day at a time

A grid or calendar SHALL move focus one cell or day at a time with the arrow keys, SHALL NOT choose a day outside its range, and SHALL leave chords with Shift, Alt or Meta to the page.

#### Scenario: Page keys move a grid ten rows at a time

- **GIVEN** a grid holds many rows
- **WHEN** the reader presses Page Down
- **THEN** focus moves ten rows

#### Scenario: A cell's own editor keeps the keys it takes

- **GIVEN** a cell's editor holds focus
- **WHEN** the reader types into it
- **THEN** the grid does not act on those keys

#### Scenario: A chord with Shift is left to the page

- **GIVEN** a grid is focused
- **WHEN** the reader presses Shift with an arrow key
- **THEN** the page's own shortcut runs
- **AND** the grid does not move focus

#### Scenario: A range is chosen in two presses

- **GIVEN** a range calendar is shown
- **WHEN** the reader chooses a start day and then an end day
- **THEN** every day from the start to the end is announced as selected

#### Scenario: A day outside the range is announced as disabled and is not chosen

- **GIVEN** a day lies outside the calendar's range
- **WHEN** the reader presses Enter on it
- **THEN** the day is announced as disabled
- **AND** the day is not chosen

### Requirement: Text fields report failing rules beside the field

A text field SHALL mark itself invalid and point at its failing message, and the form around it SHALL count its failing rules as the reader types.

#### Scenario: An empty optional field passes every rule except required

- **GIVEN** an optional text field is empty
- **WHEN** its rules are checked
- **THEN** the field passes every rule except the required rule

#### Scenario: A failing rule is announced politely beside the field

- **GIVEN** a text field has a rule that fails
- **WHEN** the rule fails
- **THEN** the field is marked invalid
- **AND** its failing message is announced without interrupting the reader

#### Scenario: A submit button stands disabled before a required field is filled

- **GIVEN** a form holds a required field that is empty
- **WHEN** the form first renders
- **THEN** its submit button stands disabled before it is pressed

### Requirement: Choice and range controls are named and announce their state

A checkbox, switch, radio group, toggle group or slider SHALL be named by its label and SHALL announce its current state.

#### Scenario: A checkbox announces mixed while only some rows are chosen

- **GIVEN** a select-all checkbox over rows where only some are chosen
- **WHEN** the checkbox is read
- **THEN** it is announced as mixed

#### Scenario: The arrow keys wrap the choice across a radio group

- **GIVEN** a radio group has its choice on its last option
- **WHEN** the reader presses the down arrow
- **THEN** the choice moves to the first option

#### Scenario: A slider announces its settled value after a drag or a key

- **GIVEN** a slider is set by a drag or an arrow key
- **WHEN** the reader releases the drag or presses the key
- **THEN** the slider announces its settled value
- **AND** a setting saved on settling is saved from the keyboard too

### Requirement: Errors interrupt and other status waits its turn

An error message SHALL be announced at once, and any other status message SHALL wait its turn to be announced.

#### Scenario: A toast holds while the reader is on it

- **GIVEN** a toast that closes itself is showing
- **WHEN** the pointer hovers it or focus is in it
- **THEN** the toast does not close

#### Scenario: Every source's toasts draw in one stack in one corner

- **GIVEN** alerts, copy confirmations, notifications and achievements arise
- **WHEN** they are shown
- **THEN** they all draw in one stack in one corner

### Requirement: The dock lists bookmarked pages ahead of recent ones

The dock SHALL list the reader's bookmarked pages ahead of the pages they visit most, and SHALL mark a bookmarked page so it reads apart from a recent one.

#### Scenario: A bookmark follows the reader to another device

- **GIVEN** a reader bookmarks a page on one device
- **WHEN** the reader signs in on another device
- **THEN** the bookmark is listed there

#### Scenario: A signed-out reader sees recent pages kept on this device

- **GIVEN** a reader is signed out
- **WHEN** the reader visits pages
- **THEN** recent pages are kept on this device only
- **AND** they are ranked by how often and how recently they were visited

#### Scenario: Home and sign-in are never listed as recent

- **GIVEN** the reader has visited home and the sign-in page
- **WHEN** the dock draws recent pages
- **THEN** neither appears among them

#### Scenario: A renamed or removed page is forgotten at the next start

- **GIVEN** a recent page has been renamed or removed since its visit
- **WHEN** the app next starts
- **THEN** the page is forgotten
- **AND** no dead link to it is kept

### Requirement: On a narrow touch screen the dock makes room for the keyboard

On a narrow touch screen the dock SHALL hide while the reader types in a composer and SHALL return when focus leaves the composer.

#### Scenario: Typing in a composer hides the dock and returns it on leaving

- **GIVEN** the dock is showing on a narrow touch screen
- **WHEN** focus enters an editable field in a composer
- **THEN** the dock hides and its room goes to the keyboard
- **AND** when focus leaves the composer the dock returns

#### Scenario: A tap on a composer's toolbar keeps the dock in place

- **GIVEN** a composer's toolbar button is shown on a narrow touch screen
- **WHEN** the reader taps the button
- **THEN** the dock stays in place
- **AND** the tap completes on the button

#### Scenario: A narrow desktop window keeps its dock

- **GIVEN** a narrow window is used with a pointer and no on-screen keyboard
- **WHEN** focus enters a composer
- **THEN** the dock stays showing

### Requirement: The status page offers the way back that fits the failure

The error page SHALL offer the way back that fits the failure, and SHALL draw no dock.

#### Scenario: A missing page offers a way home

- **GIVEN** a route that matches no page is requested
- **WHEN** the error page is shown
- **THEN** it offers a way home
- **AND** it draws no dock

#### Scenario: A failure offers a retry and a way home

- **GIVEN** a failure escapes every page
- **WHEN** the error page is shown
- **THEN** it offers a retry
- **AND** it offers a way home

### Requirement: The page-link map is regenerated with every link change

The generated page-link map SHALL match the links the pages declare, and the suite SHALL fail while the committed map is stale.

#### Scenario: A change that adds a link fails the suite until the map is regenerated

- **GIVEN** the page-link map is committed
- **WHEN** a page adds a link and the map is not regenerated
- **THEN** the suite fails

#### Scenario: A dynamic route is drawn as one node

- **GIVEN** a route takes parameters
- **WHEN** the map is generated
- **THEN** the route is one node
- **AND** it links to the page its pattern matches

#### Scenario: A route entry that lands on no page fails generation

- **GIVEN** a route entry lands on no page
- **WHEN** the map is generated
- **THEN** generation fails
