# Insulation Validation App

This repository is part of the iTwin Platform Validation API course. Please click [here](https://education.bentley.com/LearningPaths/guided-learningpaths-635082) to access the full course content. This documentation provides a high-level overview of the validation app designed in the course. The key focus is how the custom UI components interact with the validation API.

The application is built on top the [iTwin Viewer](https://developer.bentley.com/tutorials/web-application-quick-start#2-get-the-code) which is a starter template for creating your own custom iTwin experience.

## Additional Dependencies

In addition to cloning the iTwin-Viewer, this app requires the following dependencies:

```"@itwin/itwinui-react": "^1.40.0",
"@itwin/itwinui-react": "^1.40.0",
"@itwin/property-validation-client": "^0.3.1",
"@itwin/ecschema-rpcinterface-common": "^3.1.3",
"@itwin/ecschema-metadata": "^3.1.3",
"date-fns": "^2.28.0",
```

## Overview

The [ValidationUIItemsProvider](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/ValidationUiItemsProvider.tsx) provides two custom widgets to support validation workflow:

- [ValidationTestWidget](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx) (right panel).

![image-20220623105314849](./right_panel.png)

- [ValidationResultsWidget](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationResultsWidget.tsx) (bottom panel).

![image-20220622170844583](./bottom_panel.png)

These widgets interact with the validation API in the following ways:

### ValidationTestWidget

- [Fetches list of tests](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L67)
- [Fetches list of runs](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L68)
- [Fetches list of rules](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L162) (for test creation)
- [Creates tests](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L176)
- [Creates rules](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/NewRuleComponent.tsx#L48)
- [Runs tests](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L126)
- [Polls for run status](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L139)
- [Fetches run result](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationTestWidget.tsx#L145)

### ValidationResultWidget

- [Receives results](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationResultsWidget.tsx#L159) from ValidationTestWidget
- [Fetches list of rules](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/providers/widgets/ValidationResultsWidget.tsx#L163) (to present with result)

### Other classes

1) [ValidationLink](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/ValidationLink.ts): Leverages property-validation-client to make calls into the validation API.
2) [iTwinLink](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/iTwinLink.ts): Queries iModel to get list of graphical elements associated with each pipeline.
3) [Utils](https://github.com/iTwin/Course-Property-Validation-API/blob/main/src/Utils.ts): Uses quantity formatter for unit conversion.

### iTwin UI Components used

- [Table](https://itwin.github.io/iTwinUI-react/?path=/docs/core-table--expandable-subrows)
- [Modal](https://itwin.github.io/iTwinUI-react/?path=/docs/core-modal--basic)
- [Button](https://itwin.github.io/iTwinUI-react/?path=/docs/buttons-button--call-to-action)
- [Input](https://itwin.github.io/iTwinUI-react/?path=/docs/input-input--basic)
- [ProgressRadial](https://itwin.github.io/iTwinUI-react/?path=/docs/progressindicators-progressradial--determinate)
- [Select](https://itwin.github.io/iTwinUI-react/?path=/docs/input-select--basic)

## Walkthrough

The entry-point for the code is the Viewer component under the App.tsx. It takes in UIItemsProviders to provide custom widgets to extend the iTwin Viewer. More information on how to add widgets to the iTwinViewer can be found [here](https://www.youtube.com/watch?v=pzyHYtUxy4w&list=PL6YCKeNfXXd_dXq4u9vtSFfsP3OTVcL8N&index=39). In this case, the ValidationUIItemsProvider provides widgets that are located in the right and bottom panels of the app.

1) ValidationTestWidget (right): This widget acts as the entry-point for the validation workflow. It provides the ability to create new tests, rules, and runs. For creating new tests and rules, it uses modal menus that are presented when the "Create Test" button is clicked. Below this button all the validation tests and runs are listed. Once a test has been run, a view button is presented next to the run. This button fetches the run result data and sends it to the ValidationResultsWidget.

2) ValidationResultsWidget (bottom): The result widget receives the result from the test widget, and presents it in the form of a table. It also takes the elements ids of the pipelines that failed the validation test, sorts them based on issue type (insulation too high or too low), and colorizes the graphical elements associated with them using the emphasize and colorize APIs.

## Data

The example dataset this application uses in the course can be found [here](https://github.com/iTwin/Course-Property-Validation-API/tree/main/data). Please use the [iTwin Synchronizer](https://www.bentley.com/en/resources/itwin-synchronizer) to prepare a personal copy of the iTwin (if following along). Tutorial on how to do the same can be found [here](https://www.youtube.com/watch?v=TBuYGyI1BL8&list=PL6YCKeNfXXd_dXq4u9vtSFfsP3OTVcL8N&index=7).
