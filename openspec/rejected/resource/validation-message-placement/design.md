# Validation Message Placement

SurveyJS shows a failed check's message at the top of the question box by default, and lets an owner move it. This record covers that placement option.

## Why not

The survey fields spec requires a failed check's message to sit beside its field ([survey fields spec](../../../specs/resource/survey-fields/spec.md), "A question that fails a check shows its message beside the field"). A placement option would let an owner move the message away from the input it names, which the spec forbids. Every question keeps its message beside the field.
