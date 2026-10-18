# Survey Creator Licence

The Survey Editor blade embeds SurveyJS Creator (`survey-creator-vue`), which [SurveyJS licenses](https://surveyjs.io/licensing) commercially per developer, and the repository sets no licence key. The idea was to settle that before building further on the Editor: buy a licence, or replace the Creator with an authoring surface of our own over the MIT form library.

## Why not

SurveyJS asks for a licence even for internal or non-commercial use, but its [licensing FAQ](https://surveyjs.io/faq/licensing) waives it for an open-source tool that is free to use and not intended for commercialisation. Esposter is Apache-2.0, free to use and not intended for commercialisation, so the Creator stays as it is and nothing is bought or rebuilt. Replacing it would mean writing a survey designer again — question types, logic, theming and preview — to solve a problem this project does not have. This is settled: no roadmap item or product-review gap reopens it while that stays true.

## Revisit when

Esposter stops meeting the exception's conditions — it is commercialised, as [paid storage tiers](../../../changes/resource-paid-storage-tiers/design.md) would do, or stops being free to use. The choice between a licence and an authoring surface of our own is then made again, with the [response summary](../../../specs/resource/survey-response-summary/design.md) already showing that the analytics side needs no proprietary SurveyJS component.
