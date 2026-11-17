# Tasks

## 1. The declared type on a held upload

- [x] 1.1 Pass the declared mimetype into the held check, and have the touch write it as the blob's content type. Verify: a test named after the scenario 'Held bytes re-uploaded as a video are listed as a video' written first and seen failing, then passing.
- [x] 1.2 Correct the listing's comment and the file-assets design's listing row to describe the type the latest upload declared. Verify: the presign suite's test named after 'Held bytes re-uploaded with the same type keep it' passes, and the design's listing row reads as the behaviour the test shows.

## Result

The held check passes the upload's declared type to the touch, which writes it onto the blob when it is non-empty; the snapshot touch passes `""` and keeps the stored type. Both scenarios are tests in `generateReservedResourceAssetPresignedUrlEntities.test.ts` that read the result back through `readResourceFiles`; the video one failed before the change with the listing still reporting `application/octet-stream`.
