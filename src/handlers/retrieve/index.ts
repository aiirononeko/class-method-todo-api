import { APIGatewayProxyResult } from 'aws-lambda';
import {
	DynamoDBClient,
	DynamoDBClientConfig,
	ScanCommand,
	ScanCommandInput,
	ScanCommandOutput
} from '@aws-sdk/client-dynamodb';
import Task from '../../models/task';
import { createResponse } from '../../utils/createResponse';

const handler = async (): Promise<APIGatewayProxyResult> => {
	/**
	 * DynamoDBClient初期化
	 */
	const config: DynamoDBClientConfig = {};
	const client = new DynamoDBClient(config);

	/**
	 * クエリ作成
	 */
	const param: ScanCommandInput = {
		TableName: 'tasks'
	};
	const command = new ScanCommand(param);

	try {
		/**
		 * データフェッチ
		 */
		const data: ScanCommandOutput = await client.send(command);

		/**
		 * レスポンスボディ整形
		 */
		const responseBody: Task[] = [];
		if (data.Items && data.Items.length > 0) {
			data.Items.forEach((item) => {
				const { Id, Title, Content, Expiration, Status } = item;
				const todo: Task = {
					id: Id.S ?? '',
					title: Title.S ?? '',
					content: Content.S ?? '',
					expiration: Expiration.S ?? '',
					status: Status.S ?? ''
				};
				responseBody.push(todo);
			});
		}

		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = createResponse(
			200,
			JSON.stringify(responseBody)
		);
		return response;
	} catch (e) {
		console.error(e);

		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = createResponse(500, '');
		return response;
	}
};

module.exports = { handler };
