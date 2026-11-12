## Why

A program is meant to be the configuration that ties an audience, an email and a survey together and says how they are sent. It links the three and nothing more: it carries no rule about when a person is invited or reminded, so the owner decides by hand every time and the platform cannot say what is due. The owner also has to generate participants as a separate step before anything can be exported, and the status of a person says only whether they responded, not whether they were ever sent anything.

## What Changes

- A program holds sending rules beside its links. The first rule limits reminders: the days that must pass since a person was last sent something, and the most reminders one person receives. With no rule, reminders are not limited.
- One dispatch decides who is due an invite and who is due a reminder, by the same pure function the Status blade reads for its counts and the exports read for their files.
- Exporting invites or reminders records who the file covered and when, so the next dispatch knows who was already sent what.
- The separate Generate participants step goes away. Reading a dispatch or downloading the links gives every audience person a link first, and never changes one already issued.
- The status of a person gains the date they were invited and how many reminders they have had, and the status dataset gains the same two columns.
- **BREAKING** Export invites no longer sends to everyone every time: it covers people not yet invited. A person already invited is a reminder.
- The started-status proposal is dropped, since it extends participant tracking the program does not own.

## Capabilities

### Modified Capabilities

- program-resource (resource/program-resource): sending rules, the dispatch that applies them, and the record of what was sent replace the manual generate-and-export routine.

## Impact

The participant entity gains the dispatch record, as three fields, so no table is added. The program content gains a rules section whose only entry is the reminder rule. The Setup blade gains the rule fields, and the Status blade gains the due counts, the two export buttons it already has, and two columns. No email is sent by the platform; the dispatch is what a sender would read once sending is built.
