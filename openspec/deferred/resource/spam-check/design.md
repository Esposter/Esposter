# Spam Check

A check over an email that scores how likely a mail filter is to reject it. It covers the email row "Spam check". A spam test runs inside Stripo's editor, as the email client design cites, and our email has no such check.

## Why deferred

A spam score needs its own rule set over the compiled email, and no design has written one ([email client and dark previews](../email-client-and-dark-previews/design.md)). A score also has no reader until mail leaves the app, since a filter scores what is sent. Email sending is deferred with its sending domain, its compliance handling and its recipients ([email sending](../email-sending/design.md)), so a score built now would check a message nobody can send yet.

**Revisit when:** email sending is reopened, since a spam score has no reader until mail is sent.
