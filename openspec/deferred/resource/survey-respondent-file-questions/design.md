# Survey Respondent File And Signature Questions

SurveyJS has a file question, where a respondent uploads files, and a signature question, where they draw a mark. Both put a respondent's bytes into the survey's answers. The [survey form engine](../../../changes/resource-survey-form-engine-program/design.md) offers neither.

## Why deferred

A respondent is anonymous and unauthenticated, so both kinds open a public write of bytes. That needs an upload endpoint that checks type and size, a per-respondent and per-survey quota against the owner's storage, a place for the bytes, since a response row holds its answers in one table property, and a delete path when a response is deleted. That is a design with a security review of its own.

**Revisit when:** an owner needs respondents to attach a file or sign, and the public upload surface is designed with its quota and its abuse limits.
