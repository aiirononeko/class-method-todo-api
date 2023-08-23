import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DynamoDBClient,
	DynamoDBClientConfig,
	PutItemCommand,
	PutItemCommandInput
} from '@aws-sdk/client-dynamodb';

interface Todo {
	id: string;
	title: string;
	content: string;
	expiration: string;
	status: string;
}

interface UpdateTodoParam {
	title: string;
	content: string;
	expiration: string;
	status: string;
}

const handler = async (
	event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
	/**
	 * バリデーション
	 */
	if (
		event.body === null ||
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
	const requestBody: UpdateTodoParam = JSON.parse(event.body);
	const { title, content, expiration, status } = requestBody;
	const param: PutItemCommandInput = {
		TableName: 'todos',
		Item: {
			Id: {
				S: todoId
			},
			Title: {
				S: title
			},
			Content: {
				S: content
			},
			Expiration: {
				S: expiration
			},
			Status: {
				S: status
			}
		}
	};
	const command = new PutItemCommand(param);

	/**
	 * データ更新
	 */
	await client.send(command);

	/**
	 * レスポンスボディ整形
	 */
	const responseBody: Todo = {
		id: param.Item?.Id.S ?? '',
		title: param.Item?.Title.S ?? '',
		content: param.Item?.Content.S ?? '',
		expiration: param.Item?.Expiration.S ?? '',
		status: param.Item?.Status.S ?? ''
	};

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
