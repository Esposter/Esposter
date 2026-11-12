# Program started status

A program's status tells a participant who has started the survey from one who has not opened it, and from one who has finished: the status join reads the survey's saved drafts by token, the Status blade shows three states, and the status dataset gains a started column.

## Why not

A program is a configuration linking an audience, an email and a survey, with the rules that decide who is due an invite or a reminder, and the record of what it sent. A saved draft is none of that. It belongs to the survey, which stores it, so reading drafts into the program couples the program's status to the survey's draft storage for a fact the program never acts on.

It also changes no action. Reminders already reach everyone who has not finished, which includes a person who started, so the state would only be displayed. The funnel's middle, if a dashboard wants it, is a read of the survey's own responses and drafts, charted from the survey's dataset rather than from the program's.

The program's status is the run's: when a person was invited, how many reminders they have had and whether they responded ([program send rules](../../../changes/resource-program-send-rules/design.md)).

## Revisit when

An owner needs the program to act differently on a person who has started, such as a longer delay before their reminder. The rule would then read the draft, and the state would have an action to justify it.
