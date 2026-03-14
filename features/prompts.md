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
- we should have row field input be a generic vue component that is generic upon the model value passed in, and we should have a map constant mapping the column type to the field type and also the model value, that way we can update the type of the column in the props to be generic to the component and checking the column type should automatically let it update the model value type and we shouldnt need to have Boolean(modelvalue) since it should already infer. we should also update in skills that we should then inline most of these to be Map[type] or Map[type].value if multiple required so we dont need computed for each case, its very rare and niche if we do, and if we do please try to use pattern for switch keyword first, and if that doesnt work, then we fallback to if elseif and else, never just use if statements if they are chained together, note these conventions in skill md, we should inline all our prop values to take advantage of vue typescript inference, we only move to computed outside if duplicate logic is used and we want to reduce it
- youll need to fix up your expect to be defined, since it seems to be thinking your optional chain isnt necessary, check if thats true or if you just forgot to assign variables so that the expect to be defined doesnt accidentally assert the value
