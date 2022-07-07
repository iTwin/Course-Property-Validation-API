/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { Button, Input, Select } from "@itwin/itwinui-react";
import React from "react";
import ValidationLink from "../../ValidationLink";

// Component to gather user inputs and create rules for validating pipe insulation.
export const NewRuleComponent: React.FC<{ruleAdded: () => {}}> = ({ ruleAdded }) => {

    // state variables for input fields.
    const [tempLow, setTempLow] = React.useState<number>(32);
    const [tempHigh, setTempHigh] = React.useState<number>(500);
    const [insulationLow, setInsulationLow] = React.useState<number>(0);
    const [insulationHigh, setInsulationHigh] = React.useState<number>(4);
    const [material, setMaterial] = React.useState<{
        label: string;
        value: string;
    } | undefined>();

    // list of insulation materials along with their iModel values.
    const materialOptions = [
        { label: "Arnosite Asbestos", value: "ARNOSITE_ASBESTOS"},
        { label: "Calcium Silicate", value: "CALCIUM_SILICATE"},
        { label: "Careytemp", value: "CAREYTEMP"},
        { label: "Cellular Glass", value: "CELLULAR_GLASS"},
        { label: "Fiber Glass", value: "FIBER_GLASS"},
        { label: "High Temp", value: "HIGH_TEMP"},
        { label: "Kaylo 10", value: "KAYLO_10"},
        { label: "Mineral Wool", value: "MINERAL_WOOL"},
        { label: "Perlite", value: "PERLITE"},
        { label: "Poly-urethane", value: "POLY_URETHANE"},
        { label: "Styro-foam", value: "STYRO_FOAM"},
        { label: "Super-X", value: "SUPER_X"}
    ]

    // method called when "Create" button is pressed.
    const createRule = async () => {
        const materialEntry = materialOptions.filter((entry: any) => entry.value === material)
        if (materialEntry.length > 0) {
            const rule = await ValidationLink.createPipeValidationRule(insulationLow, insulationHigh, tempLow, tempHigh, materialEntry[0]);
            if (rule) 
                ruleAdded();
        }
    }

    // method to return input field.
    const getInput = (min: number, max: number, step: number, placeholder:string, onChange: (event: any) => void) => {
        return (
            <Input 
                type="number" 
                min={min} 
                max={max} 
                step={step} 
                style={{width: "20vh"}} 
                placeholder={placeholder}
                onChange={onChange}/>
        )
    }

    // render output
    return (<>
        <div  style={{marginTop: "30px"}}>
            <Select<any>
                id="insulationMaterial" 
                options={materialOptions} 
                placeholder="Insulation Material" 
                onChange={(material: { label: string, value: string}) => {setMaterial(material)}} 
                value={material} 
                style={{width: "40vh"}}/>
        </div>
        <div style={{marginTop: "20px", }}>
            Temperature Range:
            <br/>
            {getInput(32, 500, 0.5, "Low", (event: any) => {setTempLow(Number.parseFloat(event.target.value))})}
            {getInput(32, 500, 0.5, "High", (event: any) => {setTempHigh(Number.parseFloat(event.target.value))})}
        </div>
        <div >
            Insulation Thickness:
            <br/>
            {getInput(0, 4, 0.1, "Low", (event: any) => {setInsulationLow(Number.parseFloat(event.target.value))})}
            {getInput(0, 4, 0.1, "High", (event: any) => {setInsulationHigh(Number.parseFloat(event.target.value))})}
        </div>
        <Button styleType="high-visibility" onClick={createRule} style={{float: "right", marginTop: "20px"}}>Create</Button>
    </>
    );

}
