## 1. Recordings

- [ ] 1.1 Obtain `japanese-launch.mkv` and `korean-launch.mkv` from the PC launches, each from the first frame of the client's window, and read the Japanese and Korean splashes, notices and doors from them. Verify: each recording's frames at its splash, notice and door stages are taken into the parity references, and the user confirms the recordings are the PC clients' own launches.

## 2. Measuring the differences

- [ ] 2.1 Measure the publisher's logo, its place and the text's sizes and wraps for each client against the English reference. Verify: a test named after the scenario "A client with a different publisher shows its own logo", written first and seen failing.

## 3. Layouts keyed by language

- [ ] 3.1 Key a screen's layout by language only where its recording differs, and use the English layout everywhere else. Verify: tests named after the scenarios "A language without a differing recording uses the English layout" and "A language whose recording differs uses its own layout", written first and seen failing.
- [ ] 3.2 Add a visual suite image only for each language whose screen differs. Verify: tests named after the scenario "The visual suite gains an image for a differing language" and "The visual suite gains no image for a language that matches English", written first and seen failing.

## 4. Localized references

- [ ] 4.1 Compare each localized reference in its client's words, starting with the mainland health notice. Verify: a test named after the scenario "The mainland health notice is compared in its own words", written first and seen failing.
