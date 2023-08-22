import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DynamoDBClient,
	DynamoDBClientConfig,
	ScanCommand,
	ScanCommandInput,
	ScanCommandOutput
} from '@aws-sdk/client-dynamodb';

interface Todo {
	id: string;
	title: string;
	content: string;
	expiration: string;
	status: string;
}

const handler = async (
	event: APIGatewayEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	/**
	 * DynamoDBClient初期化
	 */
	const config: DynamoDBClientConfig = {};
	const client = new DynamoDBClient(config);

	/**
	 * クエリ作成
	 */
	const param: ScanCommandInput = {
		TableName: 'todos'
	};
	const command = new ScanCommand(param);

	/**
	 * データフェッチ
	 */
	const data: ScanCommandOutput = await client.send(command);

	/**
	 * レスポンスボディ整形
	 */
	const responseBody: Todo[] = [];
	if (data.Items && data.Items.length > 0) {
		data.Items.forEach((item) => {
			const { Id, Title, Content, Expiration, Status } = item;
			const todo: Todo = {
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
	const response: APIGatewayProxyResult = {
		statusCode: 200,
		body: JSON.stringify(responseBody)
	};
	return response;
};

module.exports = { handler };
