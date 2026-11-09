# Video Media

SurveyJS takes a video in two places: an image question can show a video, and an image picker's items can be videos. This record covers video in both.

## Why deferred

A survey's files are images only: its logo, an image question's picture and each image picker choice's picture ([survey theme files design](../../../specs/resource/survey-theme-files/design.md)). Each is validated and swept as a picture. A video needs its own upload and playback design, since its validation and its playback differ from a picture's.

**Revisit when:** an owner needs a video in a question or an image picker, and a video file design is written.
