## Purpose

One in-repo emoji index behind the picker, reactions and the composer's : autocomplete — native unicode, MiniSearch relevance, one global skin tone.

## Requirements

### Requirement: Every emoji surface draws on one emoji set and one search ranking

Every emoji surface SHALL draw on the same emoji set and SHALL rank search results the same way.

#### Scenario: Same name gives the same emoji everywhere

- **GIVEN** a reader types the name of an emoji in the composer's colon completion
- **WHEN** the same name is searched in the emoji picker
- **THEN** both surfaces offer the same emoji

#### Scenario: Same query ranks the same way in picker and completion

- **GIVEN** a query is entered in the emoji picker's search and in the composer's colon completion
- **WHEN** the results are shown
- **THEN** both show the same emoji in the same order

### Requirement: Emoji search matches names and keywords with the exact shortcode first

Emoji search SHALL match on shortcode, name and keywords, and an exact shortcode match SHALL be shown first.

#### Scenario: Exact shortcode is the only result

- **GIVEN** the query thumbs_up
- **WHEN** the search runs
- **THEN** the thumbs up emoji is the only result

#### Scenario: Several words must all match

- **GIVEN** the query grin f
- **WHEN** the search runs
- **THEN** only emoji matching both grin and f are shown

#### Scenario: Partial words match

- **GIVEN** the query gri
- **WHEN** the search runs
- **THEN** emoji whose names begin with gri are shown

#### Scenario: Punctuation separates words

- **GIVEN** the query grin(
- **WHEN** the search runs
- **THEN** it is searched as grin

#### Scenario: Punctuation alone shows the empty state

- **GIVEN** the query consists only of punctuation
- **WHEN** the search runs
- **THEN** no emoji is shown and the empty state is displayed

### Requirement: The picker offers every emoji in the current standard release

The emoji picker SHALL offer every emoji in the current standard release.

#### Scenario: Newer standard adds emoji to the picker

- **GIVEN** the app adopts a newer emoji standard release
- **WHEN** a reader opens the picker
- **THEN** the emoji added in that release are offered

#### Scenario: Device cannot draw a newer emoji

- **GIVEN** a reader's device cannot draw an emoji in the current standard
- **WHEN** the picker is shown
- **THEN** the emoji is still offered

### Requirement: A reaction is identified by the exact emoji picked

A reaction SHALL be identified by the exact emoji that was picked, so emoji with different skin tones are separate reactions.

#### Scenario: Different skin tones count separately

- **GIVEN** one reader reacts with a thumbs up and another reacts with a thumbs up in a different skin tone
- **WHEN** the reactions are shown
- **THEN** they appear as two reactions with their own counts

#### Scenario: Pressing a reaction again removes the reader's reaction

- **GIVEN** the reader has reacted with an emoji
- **WHEN** they press that reaction again
- **THEN** their reaction is removed
- **AND** the reaction disappears when its last reactor removes theirs

### Requirement: Hovering a reaction shows who reacted and a right-click lists everyone

Hovering a reaction SHALL show who reacted, and a right-click on it SHALL open a list of everyone who reacted.

#### Scenario: Tooltip names the first reactors

- **GIVEN** several people have reacted with the same emoji
- **WHEN** the reader hovers over the reaction
- **THEN** the tooltip names the first few reactors
- **AND** states how many others reacted

#### Scenario: Reactions dialog lists every reactor

- **GIVEN** a reaction has reactors
- **WHEN** the reader right-clicks the reaction and chooses View Reactions
- **THEN** a dialog opens listing the reactions on the message ordered by count
- **AND** the reactors of the selected reaction are listed beside it

#### Scenario: Dialog closes when the last reaction goes

- **GIVEN** the Reactions dialog is open for a message
- **WHEN** the message's last reaction is removed
- **THEN** the dialog closes

### Requirement: One skin tone applies to every emoji that supports one

The reader's chosen skin tone SHALL apply to every emoji that supports one and SHALL be remembered on the device.

#### Scenario: Chosen tone applies across the picker

- **GIVEN** the reader chooses a skin tone
- **WHEN** the picker shows emoji that support skin tones
- **THEN** those emoji appear in the chosen tone

#### Scenario: Emoji without tone support are unchanged

- **GIVEN** the reader has chosen a skin tone
- **WHEN** the picker shows an emoji that has no skin tone support
- **THEN** that emoji appears unchanged

#### Scenario: Tone applies to the person in a person-and-object emoji

- **GIVEN** the reader has chosen a skin tone
- **WHEN** a person-and-laptop emoji is shown
- **THEN** the tone is applied to the person in the emoji

#### Scenario: Group emoji take one tone for the first person only

- **GIVEN** the reader has chosen a skin tone
- **WHEN** a group emoji made of people with different tones is shown
- **THEN** only the first person takes the chosen tone

#### Scenario: Skin tone is kept after reopening the app

- **GIVEN** the reader has chosen a skin tone
- **WHEN** they reopen the app on the same device
- **THEN** the chosen tone is still applied

### Requirement: The picker opens as a popover at every screen width

The emoji picker SHALL open as a popover beside its trigger on every screen width and SHALL fit within the screen.

#### Scenario: Opening above the trigger

- **GIVEN** the picker's trigger is near the foot of the screen
- **WHEN** the reader opens the picker
- **THEN** the picker opens above the trigger

#### Scenario: Opening below when there is no room above

- **GIVEN** the trigger is at the top of the screen
- **WHEN** the reader opens the picker
- **THEN** the picker opens below the trigger

#### Scenario: Picker fits a phone screen

- **GIVEN** the reader is on a phone-sized screen
- **WHEN** the picker is open
- **THEN** it fits within the screen with a margin

#### Scenario: Touch screen does not open the keyboard

- **GIVEN** the reader is on a touch screen
- **WHEN** the picker opens
- **THEN** the search field is not focused automatically

### Requirement: Categories run from frequently used to the standard groups

The picker SHALL list Frequently Used first, then the room's own emoji, then the standard categories in their standard order.

#### Scenario: Frequently Used appears once there are recents

- **GIVEN** the reader has picked emoji before
- **WHEN** the picker is opened
- **THEN** Frequently Used is the first category

#### Scenario: Frequently Used is absent with no recents

- **GIVEN** the reader has never picked an emoji
- **WHEN** the picker is opened
- **THEN** no Frequently Used category is shown

#### Scenario: Room emoji sit between the two groups

- **GIVEN** the room has custom emoji
- **WHEN** the picker is opened
- **THEN** the room's emoji category appears after Frequently Used and before the standard categories

### Requirement: Recent emoji follow the chosen skin tone

Recent emoji SHALL be remembered on the device and SHALL show in the currently chosen skin tone.

#### Scenario: Recent emoji takes the new tone

- **GIVEN** the reader picked a thumbs up and then changed the skin tone
- **WHEN** Frequently Used is shown
- **THEN** the thumbs up appears in the new skin tone

### Requirement: The picker is fully operable from the keyboard

The emoji picker SHALL be operable from the keyboard alone.

#### Scenario: Moving through the picker with Tab

- **GIVEN** the picker is open with focus in its search field
- **WHEN** the reader presses Tab
- **THEN** focus moves to the category rail and then to the emoji grid

#### Scenario: Moving through the grid with the arrow keys

- **GIVEN** focus is on an emoji in the grid
- **WHEN** the reader presses an arrow key
- **THEN** focus moves to the neighbouring emoji in that direction

#### Scenario: Home and End move within a row

- **GIVEN** focus is on an emoji in the grid
- **WHEN** the reader presses Home or End
- **THEN** focus moves to the first or last emoji of that row

#### Scenario: Enter picks the focused emoji

- **GIVEN** focus is on an emoji in the grid
- **WHEN** the reader presses Enter
- **THEN** that emoji is picked

#### Scenario: Focused emoji is announced by name

- **GIVEN** focus is on an emoji in the grid
- **WHEN** the emoji receives focus
- **THEN** its name is announced

### Requirement: The picker follows the app's themes

The emoji picker SHALL follow the app's light and dark themes.

#### Scenario: Switching theme restyles the picker

- **GIVEN** the picker is open
- **WHEN** the reader switches the app's theme
- **THEN** the picker's colours follow the new theme
