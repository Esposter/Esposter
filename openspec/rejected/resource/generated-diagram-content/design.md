# Diagram to code and paste chart

Turning a drawn diagram into code, and pasting a chart onto the board as a chart.

## Why not

The app's one chart is the ApexCharts component that the dashboard and the survey summary mount ([charts](../../../specs/architecture/charts/design.md)), and a pasted chart would bring a second chart renderer onto the board. Diagram to code needs a model to read the drawing, and the app has no LLM dependency yet. The [AI resource generation](../../../deferred/resource/ai-resource-generation/design.md) record names the first one as a platform decision, not a whiteboard feature. Diagrams are drawn by hand.
