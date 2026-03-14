- We should fix up formdata to exclude id, since it could be passing the same thing from resued dialog, we should also add a test case for this
- @coderabbitai
coderabbitai bot
11 minutes ago
⚠️ Potential issue | 🟠 Major

Reset the draft after a successful create.

editedColumn and columnType survive onComplete(), so reopening the dialog reuses the previous values and immediately falls into stale validation or accidental resubmission.

🧹 Suggested fix
🤖 Prompt for AI Agents
Member
Author
@Q16solver
Q16solver
4 minutes ago
we'll just keep it incase they want duplicate rows
- we'll instead add a button to reset the form