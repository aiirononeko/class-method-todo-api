import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DeleteItemCommand,
	DeleteItemCommandInput,
	DynamoDBClient,
	DynamoDBClientConfig
} from '@aws-sdk/client-dynamodb';

const handler = async (
	event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
	/**
	 * バリデーション
	 */
	if (
		event.pathParameters == null ||
		event.pathParameters.todoId == undefined
	) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = {
			statusCode: 400,
			body: ''
		};
		return response;
	}

	/**
	 * DynamoDBClient初期化
	 */
	const config: DynamoDBClientConfig = {};
	const client = new DynamoDBClient(config);

	/**
	 * クエリ作成
	 */
	const todoId = event.pathParameters.todoId;
	const param: DeleteItemCommandInput = {
		TableName: 'todos',
		Key: {
			Id: {
				S: todoId
			}
		}
	};
	const command = new DeleteItemCommand(param);

	/**
	 * データ削除
	 */
	await client.send(command);

	/**
	 * レスポンス
	 */
	const response: APIGatewayProxyResult = {
		statusCode: 200,
		body: ''
	};
	return response;
};

module.exports = { handler };
