# Email client and dark-mode previews

A preview of the open email as particular mail clients draw it, and as a dark mode draws it, beside the device-width preview the editor already has.

## Why deferred

The two halves cost differently, and the builders read in full show both.

- **A client preview is a rendering service that someone meters.** Stripo's editor integrates Email on Acid for it, with a few free attempts on its plans and extra credits to buy. Klaviyo offers inbox testing from its editor's Preview for paid accounts only, with a monthly allowance, and counts each inbox preview as one test. Neither draws the clients itself. Admitting a service means a vendor, a key, a quota and a price shown to the owner, which no part of this program needs.
- **A dark-mode preview is an approximation, and builders label it as one.** Stripo's editor has a built-in preview, and its own blog says the results are "indicative rather than exact". The tool mimics a short named list of clients, Outlook and Yahoo variants among them and not Gmail, and the blog describes how real clients invert colours without saying how the preview does. Klaviyo's own dark-mode guidance says it has no direct control over how an inbox applies dark mode, and a Klaviyo staff reply from a few years back said its template editor had no tools for it. Building one here is feasible, but a preview of a dark mode needs an email that carries dark-mode styles, and none of the email pages designs one.

The cheaper interim is in the email's [layout](../../../specs/resource/email-layout/design.md): the problems surface lists the compile's validator messages today, and checks the document itself can answer, such as contrast, links and alternative text, are a later change that needs no service. Stripo also runs a spam test inside the editor on every plan, which is a check of the same kind and the model for one here.

Stripo documents a subject line and a preheader in a message-settings form, and Klaviyo documents a preview text field, a subject step in its send flow and a plain-text version kept in a separate editor. The email's preview text is already a root prop, and sending is the [deferred email sending](../email-sending/design.md) idea, so a subject line and a plain-text version wait with it.

## Revisit when

Email sending ships, so that a real recipient's client is where the question matters, or when a rendering service is admitted for another reason. A dark-mode approximation is revisited when an email can carry dark-mode styles, and it ships labelled as indicative, as Stripo's does.

## Sources

Each was read in full through the fetch tool, whose page extraction returns quotes rather than the raw page, so exact wording is checked against the page before it is quoted elsewhere.

- [Stripo's built-in dark mode](https://stripo.email/en/blog/built-in-dark-mode-in-stripo-how-stripo-helps-you-test-emails-faster): a preview in the editor, its results "indicative rather than exact", and the named clients it mimics. The label.
- [Stripo's Email on Acid integration](https://stripo.email/blog/stripo-integration-with-email-on-acid-how-to-use-our-email-testing-tool/): client previews as an external service with per-plan attempts and extra credits. The cost.
- [Stripo's spam testing](https://stripo.email/blog/email-spam-testing-what-triggers-spam-filters-and-how-to-avoid-them-with-stripo/): a check run inside the editor on every plan. The interim.
- [Klaviyo's dark mode best practices](https://help.klaviyo.com/hc/en-us/articles/360049181631): inbox testing, including a dark-mode choice, for paid accounts with a monthly count of tests, and no direct control of how an inbox applies dark mode.
- [Klaviyo's community thread on dark mode](https://community.klaviyo.com/marketing-30/dark-mode-and-the-future-at-klaviyo-2874): a staff reply that the template editor had no tools for dark mode when it was written, which is dated and not taken as current.
