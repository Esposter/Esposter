## 1. Reading colours

- [ ] 1.1 Admit a CSS colour parser through the dependency admission gate, with its ledger row, and read each colour's sRGB value and its contrast ratio against another colour in the critique module. Verify: tests named after the scenarios 'an unreadable colour is reported unchecked' and 'text at exactly 4.5 to 1 is not reported', in a test file beside the critique module, failing before the parser is wired.

## 2. Contrast

- [ ] 2.1 Resolve each text node's colour and its effective background down the tree, and report each text below 4.5 to 1 with its node id. Verify: tests named after the scenarios 'low-contrast text is reported with its node' and 'text is checked against the background its section sets', in a test file beside the critique module, seen failing first.
- [ ] 2.2 Report a text whose colour or background cannot be read as unchecked, never as passing. Verify: the test named after the scenario 'an unreadable colour is reported unchecked', in the same test file, seen failing first.

## 3. Layout and survey targets

- [ ] 3.1 Report a node whose fixed width is wider than the narrowest device the canvas draws, unless a mobile override narrows it. Verify: tests named after the scenarios 'a fixed width with no mobile override is reported' and 'a mobile override that narrows the node is not reported', in a test file beside the critique module, seen failing first.
- [ ] 3.2 Report each survey invite whose survey has no published version, taking the publish state from a lookup the caller passes in, and report an invite whose lookup failed as unchecked. Verify: tests named after the scenarios 'an invite to an unpublished survey is reported' and 'a survey lookup that fails leaves the invite unchecked', in a test file beside the critique module, seen failing first.

## 4. The critique function

- [ ] 4.1 Expose the critique as one pure function over a webpage document, with each check in its own module and a bench of its compute at the node limit. Verify: the bench runs without error at the node limit, and the function's test file runs every check above.
- [ ] 4.2 Declare the optional critique on the webpage's entry in the resource definition map, and have the read tool refuse a type that declares none, naming the type. Verify: a test named after the scenario 'a type without a critique is refused, naming the type', in the resource router's test file, seen failing first.

## 5. The agent read

- [ ] 5.1 Add the read tool to the resource router under the owner guard, answering the critique of the saved content at its version to a key holding the Resources scope, and list it in the tool listing for that scope. Verify: tests named after the scenarios 'an agent reads the critique of a saved webpage' and 'a resource the key does not own is refused', in the resource router's test file, seen failing first.

## 6. The editor

- [ ] 6.1 Add a Check panel beside the Content, Style and Theme panels, listing the open document's findings and updating as the owner edits, and selecting a finding selects its node on the canvas. Verify: tests named after the scenarios 'an unsaved edit changes the findings' and 'choosing a finding selects its node', in a test file beside the Check panel, seen failing first.

## 7. Documentation

- [ ] 7.1 List the critique capability in the page builder README, and name it among the page builder skill's owner pages. Verify: the workspace tests `openspecLinks.test.ts` and `citations.test.ts` in `scripts/src/workspace/` pass.
