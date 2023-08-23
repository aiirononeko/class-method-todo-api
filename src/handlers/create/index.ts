import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DynamoDBClient,
	DynamoDBClientConfig,
	PutItemCommand,
	PutItemCommandInput
} from '@aws-sdk/client-dynamodb';
import Todo from '../../models/todo';

interface CreateTodoParam {
	title: string;
	content: string;
	expiration: string;
}

const handler = async (
	event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
	/**
	 * バリデーション
	 */
	if (event.body === null) {
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
	const requestBody: CreateTodoParam = JSON.parse(event.body);
	const { title, content, expiration } = requestBody;
	const param: PutItemCommandInput = {
		TableName: 'todos',
		Item: {
			Id: {
				S: new Date().getTime().toString()
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
				S: 'TODO'
			}
		}
	};
	const command = new PutItemCommand(param);

	try {
		/**
		 * データ登録
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
	} catch (e) {
		console.error(e);

		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = {
			statusCode: 500,
			body: ''
		};
		return response;
	}
};

module.exports = { handler };