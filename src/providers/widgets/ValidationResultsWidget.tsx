/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect, useMemo } from "react";
import { Table } from "@itwin/itwinui-react";
import ValidationLink from "../../ValidationLink";
import { ITwinLink, Pipeline } from "../../iTwinLink";
import { EmphasizeElements, IModelApp } from "@itwin/core-frontend";
import { ColorDef } from "@itwin/core-common";
import { ResponseFromGetResult, RuleDetails } from "@itwin/property-validation-client";
import Utils from "../../Utils";

interface ValidationData extends ResponseFromGetResult {
  ruleData: {[key: string]: RuleDetails}
}

// Widget for presenting validation results (in a table) and colorizing result elements.
export function ValidationResultsWidget () {

    // validation result data
    const [validationData, setValidationData] = React.useState<ValidationData>();
    // validation result data prepared for table component.
    const [tableData, setTableData] = React.useState<any>();
    // pipelines that failed validation test.
    const [pipelines, setPipelines] = React.useState<Pipeline[]>();

    // fetch list of all pipelines from iModel.
    React.useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp)
        ITwinLink.getPipelines(vp.iModel).then((pipelines: Pipeline[]) => setPipelines(pipelines));
    }, []);

    // columns for result table.
    const columns = useMemo(() => [{
        Header: 'Table',
        columns: [{
            id: 'elementLabel',
            Header: 'Pipeline Label',
            accessor: 'elementLabel'
        }, {
            id: 'material',
            Header: 'Material',
            accessor: 'material',
        }, {
            id: 'temperature',
            Header: 'Temperature Range',
            accessor: 'temperature',
        }, {
            id: 'insulation',
            Header: 'Allowed Insulation',
            accessor: 'insulation',
        }, {
            id: 'badValue',
            Header: 'Value',
            accessor: 'badValue',
        }, {
            id: 'issue',
            Header: 'Issue',
            accessor: 'issue',
        }],
    }], []);

    // prepare validation result data for table, and colorize pipeline elements (with issues).
    React.useEffect(() => {
        if (!validationData) return;
        const prepareTableData = async () => {
            const data = [];
            // keep track of elements related to cost (excessive material) and safety (insufficient material) issues.
            let costElements: string[] = [];
            let safetyElements: string[] = [];
            
            for (const result of validationData.result) {
                // get RuleData and target pipeline for each result.
                const ruleIndex: number = Number.parseInt(result.ruleIndex);
                const ruleId = validationData.ruleList[ruleIndex].id;
                const ruleData = validationData.ruleData[ruleId];
                const pipeline = pipelines?.find((pipeline) => pipeline.id === result.elementId)
                let issue = "";

                if (pipeline && ruleData) {
                    // if bad value less than lower bound number, tag issue as "Insulation too low". Add pipe elements to safety issue list.
                    if (result.badValue < ruleData?.functionParameters.lowerBound!) {
                    safetyElements = safetyElements.concat(pipeline.pipes); 
                    issue = "Insulation too low";
                    }
                    // else tag issue as "Insulation too high". Add pipe elements to cost issue list.
                    else {
                    costElements = costElements.concat(pipeline.pipes)
                    issue = "Insulation too high";
                    }
                }

                // parse out JSON rule details from rule data.
                const ruleDetails = JSON.parse(ruleData.description);
                let material = "unspecified";

                // make rule details presentable for table output.
                if (ruleDetails.material && ruleDetails.material.label)
                    material = ruleDetails.material.label;
                const temperature = `${ruleDetails.tempLow} °F  - ${ruleDetails.tempHigh} °F`;
                const insulation = `${ruleDetails.insulationLow} inch - ${ruleDetails.insulationHigh} inch`;
                const badValue = (await Utils.convertQuantity(Number.parseFloat(result.badValue), "M", "IN")) + " inch";

                // push result entry into table data.
                data.push({
                    elementLabel: result.elementLabel,
                    material,
                    temperature,
                    insulation,
                    badValue: badValue,
                    issue,
                });
            }

            // clear (any) previous colorizations, and color cost/safety issue elements as blue/red respectively.
            const vp = IModelApp.viewManager.selectedView!;
            const emph = EmphasizeElements.getOrCreate(vp);
            emph.clearOverriddenElements(vp);
            emph.clearEmphasizedElements(vp);
            emph.overrideElements(costElements, vp, ColorDef.blue);
            emph.emphasizeElements(costElements, vp, undefined, true);
            emph.overrideElements(safetyElements, vp, ColorDef.red);
            emph.emphasizeElements(costElements, vp, undefined, false);

            // set table final data.
            setTableData(data);
        }
        prepareTableData();
    }, [validationData, pipelines]);

    // callback method on iModelApp to recieve new result data.
    useEffect(() => {
        (IModelApp as any).validationDataChanged = async (data: ResponseFromGetResult) => {
            const validationData: any = data;
            const ruleData: any = [];
            // fetch rule data to add to result data.
            const rules: RuleDetails[] = await ValidationLink.getRules();
            for (const rule of data.ruleList) {
                const data: RuleDetails = rules.filter((ruleDetails: RuleDetails) => ruleDetails.id  === rule.id )[0];
                ruleData[rule.id] = data;
            }
            validationData.ruleData = ruleData;
            setValidationData(validationData);
        }
    });

    // when table row clicked, zoom into pipeline with issue.
    const onRowClicked = async (_rows: any, state: any) => {
        const vp = IModelApp.viewManager.selectedView!;
        const pipelineId = validationData?.result[state.id].elementId;
        const pipeline = pipelines?.find((pipeline) => pipeline.id === pipelineId)
        if (pipeline) {
            vp.zoomToElements(pipeline.pipes, {animateFrustumChange: true});
            vp.iModel.selectionSet.replace(pipeline.pipes);
        }
    }

    // If tableData available, prepare table UI component.
    const table = tableData ? <Table
        columns={columns}
        data={tableData}
        emptyTableContent='No Issues.'
        isSelectable={false}
        onRowClick={onRowClicked}
        density="extra-condensed"
        /> : "No Data";

    return (<>
        {table}
    </>);
};
