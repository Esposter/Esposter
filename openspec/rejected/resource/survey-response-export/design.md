# Survey Response Export

SurveyJS exports a survey's responses to CSV or a file, so an owner can analyse them outside the app. This record covers that export.

## Why not

Esposter already exports a survey's responses. A survey has no export of its own, so it gets the generic Export CSV command that serves every resource with a dataset. That command writes one flat table, with question titles as headers and untrusted answers neutralised as formulas, and CSV is its only format ([dataset CSV export spec](../../../specs/resource/dataset-csv-export/spec.md)). A second export would duplicate the command.
