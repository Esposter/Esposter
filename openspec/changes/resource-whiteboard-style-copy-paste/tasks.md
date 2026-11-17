# Tasks

## 1. The copy

- [x] 1.1 Read an element's look as property changes, one for each field the element holds through the holding rule the paste applies, and read nothing from an image. Verify: tests named after 'Copy style takes the look of the selected element' and 'Copying an image copies no look' written first and seen failing.
- [x] 1.2 Copy the look of the one selected element into the session store, and bind the copy keys only while exactly one element is selected. Verify: test named after 'Copy style needs exactly one selected element' written first and seen failing.

## 2. The paste

- [x] 2.1 Paste the copied look onto every selected element through the holding rule, as one edit. Verify: tests named after 'Paste style gives each element the fields its kind holds', 'Paste style clears an arrowhead the copied arrow lacks' and 'Paste style is one undo step' written first and seen failing.
- [x] 2.2 Leave the paste as no edit while no look is copied in the session. Verify: test named after 'Paste style with nothing copied changes nothing' written first and seen failing.
- [x] 2.3 Keep the copied look in the app-wide session store, so a paste on another whiteboard reads it. Verify: test named after 'A copied style pastes onto another whiteboard' written first and seen failing.

## 3. The keys

- [x] 3.1 Register the copy and paste keys in the Whiteboard command group, mount them in the editor beside the stacking keys, and list them in the palette. Verify: the keyboard composable's binding tests written first and seen failing, with the scenario 'Copy style needs exactly one selected element' named in them.
- [ ] 3.2 Press the pair in a driven browser on macOS: copy the style of one shape, paste it onto a second, and undo the paste. Verify: the run's output shows the second shape take the look and the undo restore it, since on macOS the Option key can change the letter a key produces, so the pair is checked where it is pressed.
