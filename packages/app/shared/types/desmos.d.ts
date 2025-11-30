// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/desmos/index.d.ts
declare namespace Desmos {
  interface BasicCalculator extends Pick<
    Calculator,
    | "clearHistory"
    | "destroy"
    | "focusFirstExpression"
    | "getState"
    | "observeEvent"
    | "redo"
    | "resize"
    | "setBlank"
    | "setState"
    | "undo"
    | "unobserveEvent"
  > {
    updateSettings(
      settings: Parameters<typeof FourFunctionCalculator>[1] | Parameters<typeof ScientificCalculator>[1],
    ): void;
  }

  /**
   * The page element which will display your axes, grid-lines, equations, and points.
   */
  interface Calculator {
    // methods
    /**
     * Similar to GraphingCalculator.screenshot, but asynchronous. Rather than returning a PNG data URI directly,
     * callback will be called with the either a URI string or SVG string as its argument.
     */
    asyncScreenshot(callback: (dataUri: string) => void): void;
    asyncScreenshot(
      opts: Parameters<Calculator["screenshot"]>[0] & {
        /**
         * Determines the format of the generated image.
         * @default "png"
         */
        format?: "png" | "svg";
        /**
         * An object representing desired viewport bounds. The current viewport value will be used for any omitted property,
         * but note that you cannot specify top without bottom or left without right. Passing invalid bounds will log a warning
         * to the console and use the current viewport bounds in their entirety.
         */
        mathBounds?: Parameters<Calculator["setMathBounds"]>[0];
        /**
         * Determines the strategy for computing the viewport visible in the screenshot.
         * @default "contain"
         */
        mode?: "contain" | "preserveX" | "preserveY" | "stretch";
        /**
         * Determines whether to include point labels in the captured image.
         * @default false
         */
        showLabels?: boolean;
      },
      callback: (dataUri: string) => void,
    ): void;

    /**
     * Clear the undo/redo history. Does not affect the current state.
     */
    clearHistory(): void;
    /**
     * Calculator instance's current color palette
     */
    colors: Record<string, string>;

    /**
     * Destroy the GraphingCalculator instance, unbind event listeners, and free resources. This method should be called
     * whenever a calculator's container element is removed from the DOM. Attempting to call methods on a GraphingCalculator object after it has been destroyed
     * will result in a no-op and log a warning to the console.
     */
    destroy(): void;
    /**
     * An observable object containing information about the calculator's analysis of each expression.
     */
    expressionAnalysis: Record<
      string,
      {
        /**
         * The (localized) error message, if any
         */
        errorMessage?: string;
        /**
         * Numeric value(s)
         */
        evaluation?: { type: "ListOfNumber"; value: readonly number[] } | { type: "Number"; value: number };
        /**
         * Is evaluation information displayed in the expressions list?
         */
        evaluationDisplayed?: boolean;
        /**
         * Does the expression result in an evaluation error?
         */
        isError: boolean;
        /**
         * Does the expression represent something that can be plotted?
         */
        isGraphable: boolean;
      }
    >;
    /**
     * Focus the first expression in the expressions list. Note that the first expression isn't focused by default
     * because if the calculator is embedded in a page that can be scrolled, the browser will typically scroll the focused expression into view
     * at page load time, which may not be desirable.
     */
    focusFirstExpression(): void;
    /**
     * Returns a representation of the current expressions list as an array.
     */
    getExpressions(): ExpressionState[];
    /**
     * Returns a javascript object representing the current state of the calculator. Use in conjunction with GraphingCalculator.setState to save and restore calculator states.
     * The return value of GraphingCalculator.getState may be serialized to a string using JSON.stringify.
     * Warning: Calculator states should be treated as opaque values. Manipulating states directly may produce a result that cannot be loaded by GraphingCalculator.setState.
     */
    getState(): GraphState;
    /**
     * The graphpaperBounds observable property gives the bounds of the graphpaper in both math coordinates and pixel coordinates.
     */
    graphpaperBounds: {
      mathCoordinates: {
        bottom: number;
        height: number;
        left: number;
        right: number;
        top: number;
        width: number;
      };
      pixelCoordinates: {
        bottom: number;
        height: number;
        left: number;
        right: number;
        top: number;
        width: number;
      };
    };
    HelperExpression(expression: ExpressionState): {
      listValue: number[];
      numericValue: number;
      observe(eventName: "listValue" | "numericValue" | string, callback: () => void): void;
    };
    /**
     * true when an expression is selected, false when no expression is selected.
     */
    isAnyExpressionSelected: boolean;
    /**
     * Whether or not the current viewport projection is uniform with respect to both axes (i.e., the mathematical aspect ratio is square).
     */
    isProjectionUniform(): boolean;
    /**
     * Convert math coordinates to pixel coordinates.
     */
    mathToPixels<C extends { x: number; y: number } | { x: number } | { y: number }>(coords: C): C;
    /**
     * Update the settings.randomSeed property to a new random value.
     */
    newRandomSeed(): void;
    observe(eventName: string, callback: () => void): void;
    /**
     * The 'change' event is emitted by the calculator whenever any change occurs that will affect the persisted state of the calculator.
     * This applies to any changes caused either by direct user interaction, or by calls to API methods.
     * Observing the 'change' event allows implementing periodic saving of a user's work without the need for polling.
     */
    observeEvent(eventName: string, callback: () => void): void;
    /**
     * Convert pixel coordinates to math coordinates.
     */
    pixelsToMath<C extends { x: number; y: number } | { x: number } | { y: number }>(coords: C): C;
    /**
     * Advance to the next state in the undo/redo history, if available.
     */
    redo(): void;
    /**
     * Remove an expression from the expressions list.
     */
    removeExpression(expression_state: { id: string }): void;
    /**
     * Remove several expressions from the expressions list.
     */
    removeExpressions(
      expression_states: readonly {
        id: string;
      }[],
    ): void;
    /**
     * Remove the selected expression. Returns the id of the expression that was removed, or undefined if no expression was selected.
     */
    removeSelected(): string;
    /**
     * Resize the calculator to fill its container. This will happen automatically unless the autosize constructor option is set to false.
     * In that case, this method must be called whenever the dimensions of the calculator's container element change, and whenever the container element is added to or removed from the DOM.
     */
    resize(): void;
    /**
     * Returns an image of the current graphpaper in the form of a PNG data URI. You can use the returned data URI directly in the src attribute of an image.
     * To save the data as a traditional image file, you can parse the data and base64 decode it.
     */
    screenshot(opts?: {
      /**
       * Height of the screenshot in pixels. Defaults to current height of graphpaper in pixels.
       */
      height?: number;
      /**
       * Determines whether to override the default behavior of stripping out the axis numbers from small images. Only relevant if opts.width or opts.height is less than 256px.
       * @default false
       */
      preserveAxisNumbers?: boolean;
      /**
       * Oversampling factor. Larger values are useful for producing images that will look good on high pixel density ("retina") screens.
       * @default 1
       */
      targetPixelRatio?: number;
      /**
       * Width of the screenshot in pixels. Defaults to current width of graphaper.
       */
      width?: number;
    }): string;
    /**
     * Observable property that holds the id of the currently selected expression, or undefined when no expression is selected.
     */
    selectedExpressionId: string;
    /**
     * Reset the calculator to a blank state.
     */
    setBlank(options?: {
      /**
       * Preserve the undo/redo history.
       * @default false
       */
      allowUndo?: boolean;
    }): void;
    /**
     * Replace the calculator's "Delete All" button (under the "Edit List" menu) with a "Reset" button that will reset the calculator to the state
     * represented by obj. Also, if a default state is set, the "home" zoom button will reset the zoom to the viewport associated with the default state instead of the usual Desmos default
     * (roughly from -10 to 10, centered at the origin). If the showResetButtonOnGraphpaper option is true, a small reset button will appear on the graphpaper.
     */
    setDefaultState(obj: GraphState): void;
    /**
     * This will update or create a mathematical expression.
     */
    setExpression(expression: ExpressionState): void;

    /**
     * This function will attempt to create expressions for each element in the array.
     */
    setExpressions(expressions: readonly ExpressionState[]): void;

    /**
     * Updates the math coordinates of the graphpaper bounds.
     * If invalid bounds are provided, the graphpaper bounds will not be changed.
     */
    setMathBounds(bounds: { bottom?: number; left?: number; right?: number; top?: number }): void;

    // properties
    /**
     * Reset the calculator to a state previously saved using GraphingCalculator.getState.
     */
    setState(
      obj: GraphState,
      options?: {
        /**
         * Preserve the undo/redo history.
         * @default false
         */
        allowUndo?: boolean;
        /**
         * Remap colors in the saved state to those in the current Calculator.colors object. See the Colors section.
         * @default false
         */
        remapColors?: boolean;
      },
    ): void;
    /**
     * Object with observable properties for each public property.
     */
    settings: GraphConfiguration &
      GraphSettings & {
        observe(eventName: keyof GraphConfiguration | keyof GraphSettings | string, callback: () => void): void;
        unobserve(eventName: keyof GraphConfiguration | keyof GraphSettings | string): void;
      };

    /**
     * Language codes suitable for passing into Calculator.updateSettings.
     */
    supportedLanguages: string[];

    /**
     * Return to the previous state in the undo/redo history, if available.
     */
    undo(): void;

    unobserve(eventName: string): void;

    /**
     * Remove all observers added by GraphingCalculator.observeEvent('change'). For finer control over removing observers, see the section on managing observers.
     */
    unobserveEvent(eventName: string): void;

    /**
     * Updates any of the properties allowed in the constructor. Only properties that are present will be changed.
     * Also note that certain combinations of options are mutually exclusive. If an update would produce incompatible options,
     * additional options may be ignored or adjusted to obtain a compatible set. To prevent the calculator from making those adjustments on your behalf,
     * you should avoid passing in the following combinations:
     * - graphpaper: false with expressionsCollapsed: true or zoomButtons: true
     * - lockViewport: true with zoomButtons: true
     */
    updateSettings(settings: GraphConfiguration & GraphSettings): void;
  }

  type ExpressionState =
    | {
        /**
         * , hex color. See Colors. Default will cycle through 6 default colors.
         */
        color?: string;
        /**
         * Sets the drag mode of a point. See Drag Modes. Defaults to DragModes.AUTO.
         */
        dragMode?: keyof typeof DragModes;
        /**
         * Determines whether a polygon or parametric curve has its interior shaded.
         */
        fill?: boolean;
        /**
         * Determines opacity of the interior of a polygon or parametric curve. May be a number between 0 and 1, or a LaTeX string that evaluates to a number between 0 and 1. Defaults to 0.4.
         */
        fillOpacity?: number | string;
        /**
         * Determines whether the graph is drawn. Defaults to false.
         */
        hidden?: boolean;
        /**
         * Should be a valid property name for a javascript object (letters, numbers, and _).
         */
        id?: string;
        /**
         * . Sets the text label of a point. If a label is set to the empty string then the point's default label (its coordinates) will be applied.
         */
        label?: string;
        /**
         * Sets the desired position of a point's text label. See LabelOrientations.
         */
        labelOrientation?: keyof typeof LabelOrientations;
        /**
         * Sets the size of a point's text label. See LabelSizes.
         */
        labelSize?: keyof typeof LabelSizes;
        /**
         * Following Desmos Expressions.
         */
        latex?: string;
        /**
         * Determines opacity of lines. May be a number between 0 and 1, or a LaTeX string that evaluates to a number between 0 and 1. Defaults to 0.9.
         */
        lineOpacity?: number | string;
        /**
         * Determines whether line segments are plotted for point lists.
         */
        lines?: boolean;
        /**
         * Sets the line drawing style of curves or point lists. See Styles.
         */
        lineStyle?: keyof typeof Styles;
        /**
         * Determines width of lines in pixels. May be any positive number, or a LaTeX string that evaluates to a positive number. Defaults to 2.5.
         */
        lineWidth?: number | string;
        /**
         * Sets bounds of parametric curves. See note below.
         */
        parametricDomain?: {
          max: number | string;
          min: number | string;
        };
        /**
         * Determines opacity of points. May be a number between 0 and 1, or a LaTeX string that evaluates to a number between 0 and 1. Defaults to 0.9.
         */
        pointOpacity?: number | string;
        /**
         * Determines whether points are plotted for point lists.
         */
        points?: boolean;
        /**
         * Determines diameter of points in pixels. May be any positive number, or a LaTeX string that evaluates to a positive number. Defaults to 9.
         */
        pointSize?: number | string;
        /**
         * Sets the point drawing style of point lists. See Styles.
         */
        pointStyle?: keyof typeof Styles;
        /**
         * Sets bounds of polar curves. See note below.
         */
        polarDomain?: {
          max: number | string;
          min: number | string;
        };
        /**
         * Determines whether the expression should appear in the expressions list. Does not affect graph visibility. Defaults to false.
         */
        secret?: boolean;
        /**
         * Sets the visibility of a point's text label.
         */
        showLabel?: boolean;
        /**
         * Sets bounds of slider expressions. If step is omitted, '', or undefined, the slider will be continuously adjustable. See note below.
         */
        sliderBounds?: {
          max: number | string;
          min: number | string;
          step: number | string;
        };
        type?: "expression";
      }
    | {
        /**
         * Array of Table Columns.
         */
        columns: readonly {
          /**
           * Hex color. See Colors. Default will cycle through 6 default colors.
           */
          color?: string;
          /**
           * See Drag Modes. Defaults to DragModes.NONE.
           */
          dragMode?: keyof typeof DragModes;
          /**
           * Determines if graph is drawn.
           * @default false
           */
          hidden?: boolean;
          /**
           * Variable or computed expression used in the column header.
           */
          latex: string;
          /**
           * Determines opacity of lines. May be a number between 0 and 1, or a LaTeX string that evaluates to a number between 0 and 1.
           * @default 0.9
           */
          lineOpacity?: number | string;
          /**
           * Determines whether line segments are plotted.
           */
          lines?: boolean;
          /**
           * Sets the drawing style for line segments. See Styles.
           */
          lineStyle?: keyof typeof Styles;
          /**
           * Determines width of lines in pixels. May be any positive number, or a LaTeX string that evaluates to a positive number.
           * @default 2.5
           */
          lineWidth?: number | string;
          /**
           * Determines opacity of points. May be a number between 0 and 1, or a LaTeX string that evaluates to a number between 0 and 1.
           * @default 0.9
           */
          pointOpacity?: number | string;
          /**
           * Determines whether points are plotted.
           */
          points?: boolean;
          /**
           * Determines diameter of points in pixels. May be any positive number, or a LaTeX string that evaluates to a positive number.
           * @default 9
           */
          pointSize?: number | string;
          /**
           * Sets the drawing style for points. See Styles.
           */
          pointStyle?: keyof typeof Styles;
          /**
           * Array of LaTeX strings. Need not be specified in the case of computed table columns.
           */
          values?: string[];
        }[];
        id?: string;
        type: "table";
      };

  interface GraphConfiguration {
    /**
     * Allow the use of Actions. May be true, false, or 'auto'. When true or false, actions are completely enabled or disabled. When 'auto', actions are enabled, but some associated UI is only displayed after the user enters a valid action. In a future API version, 'auto' may become a synonym for true.
     * @default "auto"
     */
    actions?: "auto" | boolean;
    /**
     * Permit the calculator to generate sound, including using the tone method and in Audio Trace. See Accessibility Notes.
     * @default true
     */
    audio?: boolean;
    /**
     * Enable features intended for content authoring. See the section on Author Features.
     * @default false
     */
    authorFeatures?: boolean;
    /**
     * Determine whether the calculator should automatically resize whenever there are changes to element's dimensions. If set to false you will need to
     * explicitly call .resize() in certain situations. See .resize().
     * @default true
     */
    autosize?: boolean;
    /**
     * Add a subtle 1px gray border around the entire calculator
     * @default true
     */
    border?: boolean;
    /**
     * Show Braille controls in the settings menu and enable shortcut keys for switching between Braille modes.
     * @default true
     */
    brailleControls?: boolean;
    /**
     * none'   Set the input and output Braille code for persons using refreshable Braille displays. Valid options are 'nemeth', 'ueb', or 'none'.
     * @default "none"
     */
    brailleMode?: "nemeth" | "none" | "ueb";
    /**
     * Limit the size of an expression to 100 characters
     * @default false
     */
    capExpressionSize?: boolean;
    /**
     * When true, clearing the graph through the UI or calling setBlank() will leave the calculator in degreeMode. Note that, if a default state is set,
     * resetting the graph through the UI will result in the calculator's degreeMode matching the mode of that state, regardless of this option.
     * @default false
     */
    clearIntoDegreeMode?: boolean;
    /**
     * The color palette that the calculator will cycle through. See the Colors section.
     */
    colors?: Record<string, string>;
    /**
     * When true, users are able to toggle between decimal and fraction output in evaluations if Desmos detects a good rational approximation.
     * @default true
     */
    decimalToFraction?: boolean;
    /**
     * Enable/disable functions related to univariate data visualizations, statistical distributions, and hypothesis testing
     * @default true
     */
    distributions?: boolean;
    /**
     * Show the expressions list
     * @default true
     */
    expressions?: boolean;
    /**
     * Collapse the expressions list
     * @default false
     */
    expressionsCollapsed?: boolean;
    /**
     * Show the bar on top of the expressions list
     * @default true
     */
    expressionsTopbar?: boolean;
    /**
     * Allow the creation of folders in the expressions list
     * @default true
     */
    folders?: boolean;
    /**
     * Base font size.
     * @default 16
     */
    fontSize?: number;
    /**
     * Force distance and midpoint functions to be enabled, even if restrictedFunctions is set to true. In that case the geometry functions will also be added to the the "Misc" keypad
     * @default false
     */
    forceEnableGeometryFunctions?: boolean;
    /**
     * When true, all linearizable regression models will have log mode enabled by default, and the checkbox used to toggle log mode will be hidden from the expression interface.
     * @default false
     */
    forceLogModeRegressions?: boolean;
    /**
     * Manually set a description for the graph canvas (which replaces the automatically generated text we create). Set to an empty string to remove the description entirely, or undefined to restore the generated text. See Accessibility Notes.
     */
    graphDescription?: string;
    /**
     * Show the graphpaper
     * @default true
     */
    graphpaper?: boolean;
    /**
     * Allow adding images
     * @default true
     */
    images?: boolean;
    /**
     * Specify custom processing for user-uploaded images. See Image Uploads for more details.
     * @param file comment for stuff
     */
    imageUploadCallback?(file: File, cb: (err: Error, url: string) => void): void;
    /**
     * When true, the syntax for interval comprehensions is enabled.
     * @default true
     */
    intervalComprehensions?: boolean;
    /**
     * Display the calculator with an inverted color scheme.
     * @default false
     */
    invertedColors?: boolean;
    /**
     * Show the onscreen keypad.
     * @default true
     */
    keypad?: boolean;
    /**
     * Language. See the https://www.desmos.com/api/v1.6/docs/index.html#document-languages for more information.
     * @default "en"
     */
    language?: string;
    /**
     * Allow hyperlinks in notes/folders, and links to help documentation in the expressions list (e.g. regressions with negative R2 values or plots with unresolved detail)
     * @default true
     */
    links?: boolean;
    /**
     * Disable user panning and zooming graphpaper
     * @default false
     */
    lockViewport?: boolean;
    /**
     * 	When true, the option to use logarithmic axis scales is enabled.
     * @default true
     */
    logScales?: boolean;
    /**
     * Globally mute or unmute sound generated by the calculator's built-in tone() function. See the section on tones below.
     * @default true
     */
    muted?: boolean;
    /**
     * Allow the creation of text notes in the expressions list
     * @default true
     */
    notes?: boolean;
    /**
     * Paste a valid desmos graph URL to import that graph
     * @default false
     */
    pasteGraphLink?: boolean;
    /**
     * Paste validly formatted table data to create a table up to 50 rows
     * @default true
     */
    pasteTableData?: boolean;
    /**
     * Determine whether the calculator should plot implicit equations and inequalities
     * @default true
     */
    plotImplicits?: boolean;
    /**
     * Determine whether the calculator should plot inequalities
     * @default true
     */
    plotInequalities?: boolean;
    /**
     * Determine whether the calculator should plot single-variable implicit equations
     * @default true
     */
    plotSingleVariableImplicitEquations?: boolean;
    /**
     * Show Points of Interest (POIs) as gray dots that can be clicked on
     * @default true
     */
    pointsOfInterest?: boolean;
    /**
     * When true, fonts and line thicknesses are increased to aid legibility.
     * @default false
     */
    projectorMode?: boolean;
    /**
     * Display the keypad in QWERTY layout (false shows an alphabetical layout)
     * @default true
     */
    qwertyKeyboard?: boolean;
    /**
     * Show a restricted menu of available functions
     * @default false
     */
    restrictedFunctions?: boolean;
    /**
     * Show the settings wrench, for changing graph display
     * @default true
     */
    settingsMenu?: boolean;
    /**
     * If a default state is set, show an onscreen reset button
     * @default false
     */
    showResetButtonOnGraphpaper?: boolean;
    /**
     * Allow users to write six-dot Braille characters using the Home Row keys (S, D, F, J, K, and L). Requires that brailleMode be 'nemeth' or 'ueb'.
     * @default false
     */
    sixKeyInput?: boolean;
    /**
     * Allow the creation of sliders in the expressions list
     * @default true
     */
    sliders?: boolean;
    /**
     * 	Allow the use of "with" substitutions and list comprehensions
     * @default "true"
     */
    substitutions?: boolean;
    /**
     * When true, the tone command is enabled.
     * @default true
     */
    tone?: boolean;
    /**
     * Allow tracing curves to inspect coordinates, and showing point coordinates when clicked
     * @default true
     */
    trace?: boolean;
    /**
     * Show onscreen zoom buttons
     * @default true
     */
    zoomButtons?: boolean;
    /**
     * When true, tables and distributions will display an icon that allows the user to automatically snap the viewport to appropriate bounds for viewing that expression.
     * @default true
     */
    zoomFit?: boolean;
  }

  interface GraphSettings {
    /**
     * When true, trig functions assume arguments are in degrees. Otherwise, arguments are assumed to be in radians.
     * @default false
     */
    degreeMode?: boolean;
    /**
     * When true, use a polar grid. Otherwise, use cartesian grid.
     * @default false
     */
    polarMode?: boolean;
    /**
     * Show or hide numeric tick labels at successive angles. Only relevant when polarMode is true.
     * @default true
     */
    polarNumbers?: boolean;
    /**
     * Global random seed used for generating values from the calculator's built-in random() function. See the section on random seeds below.
     * @default ""
     */
    randomSeed?: string;
    /**
     * Show or hide grid lines on the graph paper.
     * @default true
     */
    showGrid?: boolean;
    /**
     * Show or hide the x axis.
     * @default true
     */
    showXAxis?: boolean;
    /**
     * Show or hide the y axis.
     * @default true
     */
    showYAxis?: boolean;
    /**
     * Determines whether to place arrows at one or both ends of the x axis. See Axis Arrow Modes.
     * @default "NONE"
     */
    xAxisArrowMode?: keyof typeof AxisArrowModes;
    /**
     * Label placed below the x axis.
     * @default ""
     */
    xAxisLabel?: string;
    /**
     * Subdivisions between ticks on the x axis. Must be an integer between 0 and 5. 1 means that only the major grid lines will be shown. When set to 0, subdivisions are chosen automatically.
     * @default 0
     */
    xAxisMinorSubdivisions?: number;
    /**
     * Show or hide numeric tick labels on the x axis.
     * @default true
     */
    xAxisNumbers?: boolean;
    /**
     * Spacing between numeric ticks on the x axis. Will be ignored if set too small to display. When set to 0, tick spacing is chosen automatically.
     * @default 0
     */
    xAxisStep?: number;
    /**
     * Determines whether to place arrows at one or both ends of the y axis. See Axis Arrow Modes.
     * @default "NONE"
     */
    yAxisArrowMode?: keyof typeof AxisArrowModes;
    /**
     * Label placed beside the y axis.
     * @default ""
     */
    yAxisLabel?: string;
    /**
     * Subdivisions between ticks on the y axis. Must be an integer between 0 and 5. 1 means that only the major grid lines will be shown. When set to 0, subdivisions are chosen automatically.
     * @default 0
     */
    yAxisMinorSubdivisions?: number;
    /**
     * Show or hide numeric tick labels on the y axis.
     * @default true
     */
    yAxisNumbers?: boolean;
    /**
     * Spacing between numeric ticks on the y axis. Will be ignored if set too small to display. When set to 0, tick spacing is chosen automatically.
     * @default 0
     */
    yAxisStep?: number;
  }

  type GraphState = unknown;

  /**
   * Creates a four function calculator object to control the calculator embedded in the DOM element specified by element.
   */
  function FourFunctionCalculator(
    element: HTMLElement,
    options?: {
      /**
       * Picks the extra function(s) that appear in the top bar. Maximum 2, minimum 1.
       * @default ["sqrt"]
       */
      additionalFunctions?:
        | ("exponent" | "fraction" | "percent" | "sqrt")
        | readonly ("exponent" | "fraction" | "percent" | "sqrt")[];
      /**
       * Set the input and output Braille code for persons using refreshable Braille displays.
       * @default "none"
       */
      brailleMode?: "nemeth" | "none" | "ueb";
      /**
       * Limit the size of an expression to 100 characters.
       * @default false
       */
      capExpressionSize?: boolean;
      /**
       * When true, users are able to toggle between decimal and fraction output in evaluations if Desmos detects a good rational approximation.
       * @default false
       */
      decimalToFraction?: boolean;
      /**
       * Base font size.
       * @default 16
       */
      fontSize?: number;
      /**
       * Display the calculator with an inverted color scheme.
       * @default false
       */
      invertedColors?: boolean;
      /**
       * Language. See the Languages section for more information.
       * @default "en"
       */
      language?: string;
      /**
       * Allow external hyperlinks (e.g. to braille examples)
       * @default true
       */
      links?: boolean;
      /**
       * Display the calculator in a larger font.
       * @default false
       */
      projectorMode?: boolean;
      /**
       * Display the settings menu.
       * @default true
       */
      settingsMenu?: boolean;
      /**
       * Allow users to write six-dot Braille characters using the Home Row keys (S, D, F, J, K, and L). Requires that brailleMode be 'nemeth' or 'ueb'.
       * @default false
       */
      sixKeyInput?: boolean;
    },
  ): BasicCalculator;

  /**
   * Creates a calculator object to control the calculator embedded in the DOM element specified by element.
   */
  function GraphingCalculator(element: HTMLElement, options?: GraphConfiguration & GraphSettings): Promise<Calculator>;

  function imageFileToDataURL(file: File, cb: (err: Error, url: string) => void): void;

  /**
   * Creates a scientific calculator object to control the calculator embedded in the DOM element specified by element.
   */
  function ScientificCalculator(
    element: HTMLElement,
    options?: {
      /**
       * Determine whether the calculator should automatically resize whenever there are changes to element's dimensions. If set to false
       * you will need to explicitly call .resize() in certain situations. See .resize().
       * @default true
       */
      autosize?: boolean;
      /**
       * Allows the user to export a Braille rendering of the expression list. Requires that brailleMode be 'nemeth' or 'ueb'.
       * @default true
       */
      brailleExpressionDownload?: boolean;
      /**
       * Set the input and output Braille code for persons using refreshable Braille displays.
       */
      brailleMode?: "nemeth" | "none" | "ueb";
      /**
       * Limit the size of an expression to 100 characters
       * @default false
       */
      capExpressionSize?: boolean;
      /**
       * When true, users are able to toggle between decimal and fraction output in evaluations if Desmos detects a good rational approximation.
       * @default true
       */
      decimalToFraction?: boolean;
      /**
       * When true, trig functions assume arguments are in degrees. Otherwise, arguments are assumed to be in radians.
       * @default false
       */
      degreeMode?: boolean;
      /**
       * Base font size.
       * @default 16
       */
      fontSize?: number;
      /**
       * Allow function definition, i.e. f(x) = 2x
       * @default true
       */
      functionDefinition?: boolean;
      /**
       * Display the calculator with an inverted color scheme.
       * @default false
       */
      invertedColors?: boolean;
      /**
       * Language. See the Languages section for more information.
       * @default "en"
       */
      language?: string;
      /**
       * Allow external hyperlinks (e.g. to braille examples)
       * @default true
       */
      links?: boolean;
      /**
       * Display the calculator in a larger font.
       * @default false
       */
      projectorMode?: boolean;
      /**
       * Display the keypad in QWERTY layout (false shows an alphabetical layout)
       * @default true
       */
      qwertyKeyboard?: boolean;
      /**
       * Display the settings menu.
       * @default true
       */
      settingsMenu?: boolean;
      /**
       * Allow users to write six-dot Braille characters using the Home Row keys (S, D, F, J, K, and L). Requires that brailleMode be 'nemeth' or 'ueb'.
       * @default false
       */
      sixKeyInput?: boolean;
    },
  ): BasicCalculator;
}
