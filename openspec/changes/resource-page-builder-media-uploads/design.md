## Context

The FileAssets capability already hosts uploads for an email image, the note's inline images and the webpage's share image. Each upload is the same two-step round-trip: the client hashes the bytes, the server answers with the address when it already holds them or a write target named for their hash otherwise, and the stable asset address is what the content embeds. The webpage's image node stores a typed address validated by the webpage URL schema, and its video node stores the same. Nothing lists a resource's files: the files live under the resource's own directory in the resource-assets R2 bucket, and the only way to find one today is to know its address. The upload's input schema bounds each file's declared size by the request size limit, and its declared type is the one the client gives.

## Gap analysis

| Feature                                         | Verdict                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Upload an image into the page content [webpage] | Built here: an upload first in the image's field, the address field kept below it       |
| Upload a video [webpage]                        | Built here: the same round-trip, with the video types and the file request size limit   |
| Browse uploaded assets [webpage]                | Built here: a picker over the webpage's own files, filtered to the kind the field takes |
| Browse images already uploaded [email]          | Built here: a picker over the email's own files beside its upload                       |

## Decisions

- **The upload comes first and the address field stays.** A published page already holds typed addresses, and removing the field would strand them. Rejected: removing the address field, which needs a migration of the stored addresses the clean-slate rule does not allow. The external image allowlist the archived design names is a separate item, recorded under Not built.
- **Every webpage upload uses the one round-trip the email and the note use.** Rejected: a second upload path for pages, which would hash, sign and reserve storage its own way and drift from the quota.
- **The picker lists the files the resource holds, not the addresses its content names.** A replaced image would leave a content-derived list, and an upload not yet placed could not be picked again. Rejected: a list derived from the content. Rejected: a library shared across resources, which the file-assets design already refuses, since assets are meaningless outside their resource.
- **The picker's kind comes from the type the upload declared.** The declared type is what the signed write carried, and the file name's extension is whatever the owner typed. Rejected: the extension, which a file name can misstate.
- **Webpage images take the four image types the note takes.** Those are the constant the note names for its inline images, and they exclude SVG, which runs script when it is opened directly. Rejected: SVG, and a second list of image types for pages.
- **The email image picker is drawn in a panel another change regroups.** The picker sits in the flat email style panel that [style coverage](../resource-page-builder-style-coverage/design.md) regroups into sectors, so it joins whichever sector holds the image's controls, and the two changes land in either order. Rejected: a panel of its own for the picker, which would be a second place for an image's controls.
- **A video is limited by the file upload's request size.** The reservation the quota takes is sized in the one input schema every file asset shares, so a larger limit is a storage decision, not a video one. Rejected: a video-only limit, which would reserve against a size the schema does not hold. Larger videos are recorded under Not built.
- **A non-image file is refused before the upload starts.** The server accepts any declared type for a file asset, as it does for every resource type, so the webpage's field is the rule for its kind. Rejected: a server check for the webpage alone, since the input schema is shared by every file-asset type.

## Rejected

- A poster frame for a video, left under Not built: a poster is a second file for each video.
- A picker that replaces the upload control. The upload stays the first action of each field, and the picker sits beside it, so an owner with a new file never has to go through the list.

## Risks and trade-offs

- A declared type is trusted by the server. A client that declares another type gets it listed under that type, and the server does not check the bytes. The limit is the same as for every file asset, and the proof for it is the upload's own check, not a test of the bytes.
- A video plays from the asset address, which redirects to a signed read address. Whether a browser's ranged playback follows that redirect is proved in a driven browser, not in a unit test, so the run-app procedure is the check.

## Not built

- External image addresses restricted to an allowlist, as the archived page builder design names. The typed address keeps its current rule.
- Videos above the file request size limit. A larger limit needs the reservation redesigned, and no owner has asked for one.
- A video poster. A poster is a second file for each video, and no owner has asked for one yet.

## Key files

| File                                                                       | Role                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/web/shared/services/pageBuilder/imageNodeType.ts`                    | the image node, whose source gains an upload beside its address           |
| `apps/web/shared/services/pageBuilder/videoNodeType.ts`                    | the video node, whose source gains an upload beside its address           |
| `apps/web/shared/services/pageBuilder/webpageUrlSchema.ts`                 | the address check the typed source keeps                                  |
| `apps/web/app/components/PageBuilder/ContentPanel.vue`                     | the Content panel that draws the webpage's media fields and their pickers |
| `apps/web/app/composables/resource/useUploadResourceFile.ts`               | the upload round-trip every media field calls                             |
| `apps/web/app/components/Resource/Webpage/Settings.vue`                    | the share image's upload, the model for a webpage field that uploads      |
| `apps/web/app/components/PageBuilder/Email/ImageUploadField.vue`           | the email's upload, beside which its picker is drawn                      |
| `apps/web/app/components/PageBuilder/Email/StylePanel.vue`                 | the email's style panel, which draws the image upload and its picker      |
| `apps/web/shared/models/file/MimeType.ts`                                  | the content types, which gain the two video types                         |
| `apps/web/shared/services/resource/note/constants.ts`                      | the four image types the webpage image takes, the note's constant         |
| `apps/web/shared/models/db/resource/GenerateUploadFileSasEntitiesInput.ts` | the upload's input, whose declared size is bounded by the request limit   |
| `apps/web/shared/services/app/constants.ts`                                | the file request size limit a video is bounded by                         |
| `apps/web/server/trpc/procedure/resource/createResourceProcedures.ts`      | the file procedures, which gain the owner's listing of a resource's files |
| `packages/db-schema/src/services/storage/getResourceFilesDirectoryName.ts` | the files directory the listing reads                                     |

## New code lands here

```text
apps/web/app/components/PageBuilder/FilePicker/          the picker over a resource's files, filtered to a kind
apps/web/server/services/resource/listResourceFiles.ts   the owner's listing of the files under a resource
```
