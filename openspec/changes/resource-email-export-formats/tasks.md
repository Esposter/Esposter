# Tasks

## 1. The HTML file

- [ ] 1.1 Add the HTML export of an email, downloading the compile of the saved email as one file with no dataset required. Verify: tests named after the scenarios 'An unbound email downloads as one HTML file' and 'An email that fails strict validation is not downloaded' written first and seen failing.
- [ ] 1.2 Keep merge fields as their tokens in the file and leave images at their app addresses. Verify: tests named after the scenarios 'A merge field stays as its token in the file' and 'An image in the HTML file needs a signed-in session' written first and seen failing.

## 2. The MJML source

- [ ] 2.1 Add the MJML source export, writing the saved document's source through the package's writer as one file. Verify: tests named after the scenarios 'The MJML source downloads as one file' and 'The MJML source imports back to the same email' written first and seen failing.
- [ ] 2.2 Stop both downloads when the save before them is refused and show the refusal. Verify: a test named after the scenario 'A refused save stops the download' written first and seen failing.

## 3. The menu

- [ ] 3.1 List the HTML, MJML source and personalized HTML exports together in the email's export commands. Verify: a test named after the scenario 'The email offers its three exports' written first and seen failing.

## 4. The record

- [ ] 4.1 Update the email personalization design's Notes to name the new exports and their caller, and the mjml-blocks README's note that names the serialiser's export. Verify: `pnpm exec openspec validate resource-email-export-formats --strict --no-interactive` passes.
