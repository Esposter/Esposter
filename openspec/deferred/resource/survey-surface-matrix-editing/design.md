# Survey Surface Matrix Editing

Editing a matrix question's rows and columns in place on the design surface, as the survey creator edits a choice question's choices there. [SurveyJS Creator's end-user guide](https://surveyjs.io/survey-creator/documentation/end-user-guide/user-interface) lets the author edit UI text in place and reorder choices from the question's adorners on the surface.

## Why deferred

A choice list is one column of text, which the surface edits in the question's own box. A matrix has two axes, its rows and its columns, and each column carries a cell kind of its own, so editing it in place needs a grid of fields over the drawn matrix and a place for each column's kind, which the surface has no room for. The property panel's row and column editors already edit both axes with their kinds, so the surface leaves them there until the in-place choice editing shows how authors use it.

**Revisit when:** the in-place choice editing has shipped and authors edit a matrix's rows or columns often enough that the trip to the property panel is the slow part.
