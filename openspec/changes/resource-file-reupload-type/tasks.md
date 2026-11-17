# Tasks

## 1. The declared type on a held upload

- [ ] 1.1 Pass the declared mimetype into the held check, and have the touch write it as the blob's content type. Verify: a test named after the scenario 'Held bytes re-uploaded as a video are listed as a video' written first and seen failing, then passing.
- [ ] 1.2 Correct the listing's comment and the file-assets design's listing row to describe the type the latest upload declared. Verify: `readResourceFiles` test named after 'Held bytes re-uploaded with the same type keep it' passes, and the design's listing row reads as the behaviour the test shows.
