/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import { IModelApp } from "@itwin/core-frontend";
import { ParamsToCreateRule, ParamsToCreateTest, ParamsToGetResult, ParamsToGetRuleList, ParamsToGetRunList, ParamsToGetTemplateList, ParamsToGetTestList, ParamsToRunTest, PropertyValidationClient, ResponseFromGetResult, Rule, RuleDetails, RuleTemplate, Run, RunDetails, Test, TestItem } from "@itwin/property-validation-client";
import Utils from "./Utils";

// Wrapper class that interacts with the Validation API.
export default class ValidationLink {

    // PropertyValidationClient for making calls into the API.
    private static client = new PropertyValidationClient(undefined, () => ValidationLink.getAccessToken());

    private static async getAccessToken(): Promise<string> {
        if (!IModelApp.authorizationClient)
            throw new Error("Auth client is not defined.");

            return IModelApp.authorizationClient.getAccessToken();
    }

    /* 1) Create Rules */

    // Get rule templates. This allows creation of different types of rules.
    public static async getTemplates(): Promise<RuleTemplate[]> {

        const params: ParamsToGetTemplateList = {
            urlParams: {
                projectId: process.env.IMJS_ITWIN_ID!
            }
        }

        const iterator = ValidationLink.client.templates.getList(params);

        const ruleTemplates = [];
        for await (const ruleTemplate of iterator)
            ruleTemplates.push(ruleTemplate);

        return ruleTemplates;
    }

    // Create a PropertyValueRange type rule to validate pipe insulation thicknesses for a given temperature range and material type.
    public static async createPipeValidationRule(insulationLow: number, insulationHigh: number, tempLow: number, tempHigh: number, material: {label: string, value: string}): Promise<Rule> {

        const templates = await ValidationLink.getTemplates();
        const template = templates.filter((template) => template.displayName === "PropertyValueRange")[0];

        // Converting input units from Imperial to SI (which is what iModel uses).
        const insulationLowMeters = await Utils.convertQuantity(insulationLow, "IN", "M");
        const insulationHighMeters = await Utils.convertQuantity(insulationHigh, "IN", "M");
        const tempLowKelvin = await Utils.convertQuantity(tempLow, "FAHRENHEIT", "K");
        const tempHighKelvin = await Utils.convertQuantity(tempHigh, "FAHRENHEIT", "K")

        // Generating a rule name based on material and temperature, insulation ranges.
        const ruleName = `${material.label} | Temperature: ${tempLow} - ${tempHigh} | Insulation: ${insulationLow} - ${insulationHigh}`;
        // Preserving insulation, temperature (and material) values in original units. For later presentation use. 
        const ruleDetails = {insulationLow, insulationHigh, tempLow, tempHigh, material};

        const params: ParamsToCreateRule = {
            displayName: ruleName,
            description: JSON.stringify(ruleDetails),
            templateId: template.id,
            severity: "high",
            ecSchema: "Openplant_3d",
            ecClass: "Piping_network_system",
            whereClause: `NORMAL_OPERATING_TEMPERATURE < ${tempHighKelvin} AND NORMAL_OPERATING_TEMPERATURE > ${tempLowKelvin} AND INSULATION = '${material.value}'`,
            dataType: "property",
            functionParameters: {
                upperBound: `${insulationHighMeters}`,
                lowerBound: `${insulationLowMeters}`,
                propertyName: "INSULATION_THICKNESS"
            },
        }

        return ValidationLink.client.rules.create(params);
    }

    // Get all rules for a given iTwin.
    public static async getRules(): Promise<RuleDetails[]> {
        const params: ParamsToGetRuleList = {
            urlParams: {
                projectId: process.env.IMJS_ITWIN_ID!
            },
        }

        const iterator = ValidationLink.client.rules.getRepresentationList(params);
        
        const rules = [];
        for await (const rule of iterator)
            rules.push(rule);

        return rules;
    }

    /* 2) Create Tests */

    // Create a new test given a list of rule ids.
    public static async createTest(testName: string, description: string, ruleIds: string[]): Promise<Test> {

        const params: ParamsToCreateTest = {
            projectId: process.env.IMJS_ITWIN_ID!,
            displayName: testName,
            description: description,
            rules: ruleIds,
            stopExecutionOnFailure: false,
        }

        return ValidationLink.client.tests.create(params);
    }

    // Get all tests for a given iTwin.
    public static async getTests(): Promise<TestItem[]> {
        const params: ParamsToGetTestList = {
            urlParams: {
                projectId: process.env.IMJS_ITWIN_ID!
            },
        }

        const iterator = ValidationLink.client.tests.getList(params);
        const tests = [];
        for await (const test of iterator)
            tests.push(test);
        
        return tests;
    }

    /* 3) Runs and Results */

    // Run test with a given id.
    public static async runTest(testId: string): Promise<Run | undefined> {

        const params: ParamsToRunTest = {
            testId,
            iModelId: process.env.IMJS_IMODEL_ID!,
            namedVersionId: "00f8a265-2cef-49e2-8cb3-49bb86d203a8"
        }

        return ValidationLink.client.tests.runTest(params);
    }

    // Get all runs for a given iTwin.
    public static async getRuns(): Promise<RunDetails[]> {
        const params: ParamsToGetRunList = {
            urlParams: {
                projectId: process.env.IMJS_ITWIN_ID!
            },
        }

        const iterator = await ValidationLink.client.runs.getRepresentationList(params);
        const runs = [];
        for await (const run of iterator)
            runs.push(run);

        return runs;
    }

    // Get results for a given result id.
    public static async getResult(resultId: string): Promise<ResponseFromGetResult> {

        const params: ParamsToGetResult = {
            resultId
        }

        return ValidationLink.client.results.get(params);
    }

}