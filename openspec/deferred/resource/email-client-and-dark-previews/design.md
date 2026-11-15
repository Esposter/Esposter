# Email client and dark-mode previews

A preview of the open email as particular mail clients draw it, and as a dark mode draws it, beside the device-width preview the editor already has.

## Why deferred

The two halves cost differently.

- **A client preview is a metered service.** Drawing the clients means a rendering service with a vendor, a key, a quota and a price, which no part of this program needs. The editors the builders read buy it in from an outside testing service rather than drawing the clients themselves ([Stripo](https://stripo.email/blog/stripo-integration-with-email-on-acid-how-to-use-our-email-testing-tool/), [Klaviyo](https://help.klaviyo.com/hc/en-us/articles/360049181631)).
- **A dark-mode preview is an approximation.** Real clients invert colours in ways a preview does not reproduce, so the one builders ship labels its result as indicative ([Stripo](https://stripo.email/en/blog/built-in-dark-mode-in-stripo-how-stripo-helps-you-test-emails-faster)). A preview of a dark mode also needs an email that carries dark-mode styles, and none of the email pages designs one.

**Cheaper interim:** the checks the document can answer without a service, such as contrast, links and alternative text, which the [email layout](../../../specs/resource/email-layout/design.md) builds on the validator messages the compile already lists.

The subject line and a plain-text version wait with the [deferred email sending](../email-sending/design.md), since both are read by a sent message.

## Revisit when

Email sending ships, so that a real recipient's client is where the question matters, or when a rendering service is admitted for another reason. A dark-mode approximation is revisited when an email can carry dark-mode styles, and it ships labelled as indicative.

## Sources

- [Stripo's Email on Acid integration](https://stripo.email/blog/stripo-integration-with-email-on-acid-how-to-use-our-email-testing-tool/): client previews as an external, metered service.
- [Stripo's built-in dark mode](https://stripo.email/en/blog/built-in-dark-mode-in-stripo-how-stripo-helps-you-test-emails-faster): the preview in the editor, and its results being indicative rather than exact.
- [Klaviyo's dark mode best practices](https://help.klaviyo.com/hc/en-us/articles/360049181631): inbox testing for paid accounts, and no direct control over how an inbox applies dark mode.
