import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {formateDate, isWorkday} from "./WorkdayHelper";

export class WorkdayNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Workday Node',
		name: 'workdayNode',
		group: ['transform'],
		version: 1,
		description: 'Basic Example Node',
		defaults: {
			name: 'Workday Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			// Node properties which the user gets displayed and
			// can change on the node.
			{
				displayName: 'Date',
				name: 'date',
				type: 'string',
				default: formateDate(new Date()),
				placeholder: 'Please select a location',
				description: 'The location of the Workday instance',
			},

			{
				displayName: 'Location',
				name: 'location',
				type: 'options',
				options: [
					{
						name: 'China',
						value: 'cn'
					}
				],
				default: 'cn',
				placeholder: 'Please select a location',
				description: 'The location of the Workday instance',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let location: string;
		let date: string;
		// Iterates over all input items and add the key "myString" with the
		// value the parameter "myString" resolves to.
		// (This could be a different value for each item in case it contains an expression)
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				location = this.getNodeParameter('location', itemIndex, '') as string;
				date = this.getNodeParameter('date', itemIndex, '') as string;
				item = items[itemIndex];

				item.json['location'] = location;
				item.json['date'] = date;
				item.json['workday'] =  await isWorkday(date);

			} catch (error) {
				if (this.continueOnFail()) {
					items.push({json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex});
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}
		return this.prepareOutputData(items);
	}
}
