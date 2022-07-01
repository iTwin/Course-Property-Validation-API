/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Table } from "@itwin/itwinui-react";
import React, { useMemo } from "react";

// Component that lists validations rules to support test creation.
export const ValidationRuleTable: React.FC<{ ruleList: any[], rulesSelected: (ruleIds: string[]) => void }> = ({ ruleList, rulesSelected }) => {

    const [tableData, setTableData] = React.useState<any[]>([]);

    // when new rule is selected, pass ruleIds (back to parent) using "rulesSelected" callback prop.
    const onSelect = (_rows: any, state: any) => {
        const ruleIds = [];

        for (const index in state.selectedRowIds) {
            const ruleId = ruleList[Number.parseInt(index)].id;
            ruleIds.push(ruleId);
        }

        rulesSelected(ruleIds);
    }

    // columns for presenting rule list
    const columns = useMemo(() => [{
        Header: 'Table',
        columns: [{
            id: 'material',
            Header: 'Material',
            accessor: 'material',
        }, {
            id: 'temperature',
            Header: 'Temperature Range',
            accessor: 'temperature'
        }, {
            id: 'insulation',
            Header: 'Insulation Thickness',
            accessor: 'insulation'
        }],
    }], []);

    // Set table data using latest ruleList (from props).
    React.useEffect(() => {
        const data = [];

        for (const rule of ruleList) {
            const ruleData = JSON.parse(rule.description);

            let material = "unspecified";

            if (ruleData.material && ruleData.material.label)
                material = ruleData.material.label;

            data.push({
                material,
                temperature: `${ruleData.tempLow} °F  - ${ruleData.tempHigh} °F`,
                insulation: `${ruleData.insulationLow} inch - ${ruleData.insulationHigh} inch`,
            });
        }

        setTableData(data);
    }, [ruleList]);

    return (
        <Table
            columns={columns}
            data={tableData}
            emptyTableContent='No Rules'
            isSelectable={true}
            onSelect={onSelect}
            style={{minHeight: 0}}
            enableVirtualization
        />
    );

}