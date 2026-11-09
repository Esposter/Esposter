# Canvas Image Previews

Pictures drawn in the email's design canvas, so the author sees the image rather than a box. It covers the email row "Images drawn in the design canvas". GrapesJS draws a component's content on its canvas, pictures included.

## Why deferred

The email's design canvas draws a labelled box for a picture and for a social row, because the canvas does not load their pictures ([email design](../../../specs/resource/page-builder/email/design.md)). A drawn picture would change that rule, and the canvas would show an image with nothing proving it matches the compiled email. The browser proof that would hold the design canvas to the compiled email is deferred ([editor browser suite](../editor-browser-suite/design.md)), so the labelled box stays the honest drawing until that proof exists.

**Revisit when:** the browser proof of the design canvas against the compiled email is built, so a drawn picture can be checked against the email it previews.
