# Date Function Aliases

SurveyJS has date functions named `currentDate` and `getDate`. This record covers those two names.

## Why not

The expression language names each job once ([survey expression design](../../../specs/resource/survey-expression/design.md), R10). `today` gives the clock's day, and `year` and `dateDiff` cover the other date jobs, so `currentDate` and `getDate` are not functions. R10 lists them with `currentYear`, `getYear` and `diffDays` as names the check refuses.
