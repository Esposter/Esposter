# Input Mask

SurveyJS applies an input mask to a text field, so an answer is typed in one fixed shape, such as the digits of a phone number. This record covers that mask as a setting in the Creator and as its use in the runner.

## Why deferred

No kind holds a mask prop. A mask would be a new prop on the text kind, applied by the field as the respondent types and checked by the answer schema, which the server runs too ([survey respondent design](../../../specs/resource/survey-respondent/design.md)). That is an engine model change with its own design. The pattern check already refuses a wrong shape once an answer is given, so a mask would only shape the typing itself.

**Revisit when:** owners need answers typed in a fixed shape as they type, and a mask design is written.
