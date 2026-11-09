## Context

The email's export formats are declared in the portable format map. Its one entry, personalized HTML, first saves the open email, then compiles the stored copy on the server, then either refuses without a dataset or fills each row into the compiled markup. The compile is the server's MJML compile, the same one the preview and the public web view run, and it refuses markup that fails strict validation. The MJML source writer takes the document's MJML JSON and writes source. It is tested and exported by the package, and nothing in the apps calls it. The webpage's HTML export renders in the browser, because its renderer is a pure function both sides run; an email's compile cannot, since MJML's compiler runs on the server.

## Gap analysis

| Feature                                                  | Verdict                                                                                               |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Single email HTML export without a bound dataset [email] | Built here: an HTML entry that downloads the compile of the saved email, whatever its dataset binding |
| MJML source export [email]                               | Built here: an MJML entry that writes the saved document's source through the package's writer        |

## Decisions

- **The HTML file comes from the server compile.** It is the same file the preview draws and the public web view serves, so an author exports what a reader gets. Rejected: rendering the email in the browser, since the MJML compiler runs on the server, so a browser render would be a second compile of the same document that could disagree with the preview.
- **The MJML source comes from the saved document.** Both exports save first, so the file holds the email as the server stores it. Rejected: writing the source from the editor's held state without saving, which would download an email the server does not hold.
- **A refused save stops both downloads.** A save that the server refuses leaves the stored copy behind the editor, so a download would ignore the author's latest edit without saying so. Rejected: exporting the last saved copy after a refusal, which is the silent case, and exporting the editor's state, which is the first decision's rejected alternative.
- **Merge fields stay as their tokens in the HTML file.** A file with no dataset is a template, and its tokens are what the author wrote. Rejected: refusing an email with merge fields when no dataset is bound, which would stop the template export, and blanking the tokens, which would hide them.
- **Images keep their app addresses.** An image in the HTML file loads only with the owner's session, as the personalized export's images do. Rejected: embedding each image as data in the file, since a file holding every image of an email is large and becomes the only copy of its bytes outside the app. Durable public addresses wait for the [email sending](../../deferred/resource/email-sending/design.md) idea.
- **One menu offers the three exports.** The personalized export keeps its place, and the two new ones sit beside it. Rejected: a separate export dialog per format, which would make an author look for each one.

## Rejected

- A server procedure for the MJML source. The source is written from the saved document in the browser, as the document's renderer is, so the server needs no new route.
- A zip for the HTML file. One file is what the author takes, and the images are not in it.

## Risks and trade-offs

- The HTML file's images break outside a signed-in session, which the file's description states. An author who sends the file as it is sends a message with missing images, so the Notes say so beside the export.

## Not built

- Images embedded in the HTML file, and durable public image addresses. Both wait on the [email sending](../../deferred/resource/email-sending/design.md) idea, which owns the public addresses.

## Key files

| File                                                          | Role                                                                                                |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `apps/web/app/services/resource/PortableFormatMap.ts`         | the email's export entries, which gain the HTML and MJML source formats beside the personalized one |
| `apps/web/app/services/emailEditor/compileStoredEmail.ts`     | the compile of the saved email, which the HTML file downloads                                       |
| `apps/web/app/services/emailEditor/exportPersonalizedRows.ts` | the download the personalized export makes, whose file naming the new exports share                 |
| `apps/web/app/store/emailEditor/index.ts`                     | the save the exports run first, whose refusal stops the download                                    |
| `apps/web/server/trpc/routers/email.ts`                       | the router that serves the compile                                                                  |
| `apps/web/server/services/emailEditor/compileEmailContent.ts` | the compile the preview, the web view and the exports share                                         |
| `packages/mjml-blocks/src/services/serializeMjml.ts`          | the MJML source writer, which gains its first caller                                                |
| `packages/mjml-blocks/src/services/renderMjmlDocument.ts`     | the document's MJML JSON the writer takes                                                           |

## Sources

- [MJML's documentation](https://documentation.mjml.io/): the source format the writer produces, which the read back of the package already parses.
