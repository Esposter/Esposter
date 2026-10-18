# Email Merge-Field Fallbacks

Mailchimp lets an audience field carry a default merge value, so "Hi {{First name}}" reads "Hi there" for a contact with no first name rather than "Hi ". Here it would be a default per bound column, stored beside the email's `datasetReference` and used by `substituteMergeFields` when a row's cell is empty.

## Why deferred

The exported files are read by their sender before they go anywhere, since nothing sends them ([email sending](../email-sending/design.md)); an empty cell is seen and fixed in the source Sheet or survey. A fallback earns its line when a send goes out unread.

## Revisit when

Email sending un-defers, or a dataset whose empty cells cannot be filled at the source is bound to an email.

## Cheaper interim

Fill the empty cells in the bound Sheet, or word the sentence so it reads with the field empty.
