/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { UiItemsProvider, StagePanelLocation, StagePanelSection, AbstractWidgetProps } from "@itwin/appui-abstract";
import { ValidationResultsWidget } from "./widgets/ValidationResultsWidget";
import { ValidationTestWidget } from "./widgets/ValidationTestWidget";

// Provides custom widgets to support validation workflow.
export class ValidationUiItemsProvider implements UiItemsProvider {
  public readonly id = "ValidationUiProvider";
  
  public provideWidgets(stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection | undefined): readonly AbstractWidgetProps[] {
    const widgets: AbstractWidgetProps[] = [];

    // Widget to create and run validation tests (on right panel).
    if(stageId === "DefaultFrontstage" && location === StagePanelLocation.Right) {

      const testWidget: AbstractWidgetProps = {
        id: "runValidationTests",
        label: "Validation Tests",
        getWidgetContent: () => {
          return (<ValidationTestWidget/>);
        }
      }

      widgets.push(testWidget);
    }

    // Widget to view validation results: Table and element colorization (on bottom panel).
    if (stageId === "DefaultFrontstage" && location === StagePanelLocation.Bottom) {

      const widget: AbstractWidgetProps = {
        id: "viewValidationResults",
        label: "Validation Results",
        getWidgetContent: () => {
          return (<ValidationResultsWidget/>);
        }
      }

      widgets.push(widget);
    }

    return widgets;
  };
}