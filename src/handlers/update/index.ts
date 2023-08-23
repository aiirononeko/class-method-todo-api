import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DynamoDBClient,
	DynamoDBClientConfig,
	GetItemCommand,
	GetItemCommandInput,
	GetItemCommandOutput,
	PutItemCommand,
	PutItemCommandInput
} from '@aws-sdk/client-dynamodb';
import Todo from '../../models/todo';

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
	const errorMessage = validate(event);
	if (errorMessage) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = {
			statusCode: 400,
			body: errorMessage
		};
		return response;
	}

	/**
	 * DynamoDBClient初期化
	 */
	const config: DynamoDBClientConfig = {};
	const client = new DynamoDBClient(config);

	/**
	 * 対象レコード確認
	 */
	const todoId = event.pathParameters?.todoId ?? '';
	const targetData = await checkTargetRecordExists(client, todoId);
	if (!targetData.Item) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = {
			statusCode: 404,
			body: ''
		};
		return response;
	}

	/**
	 * クエリ作成
	 */
	const requestBody: UpdateTodoParam = JSON.parse(event.body ?? '');
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

	try {
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

const validate = (event: APIGatewayEvent): string | undefined => {
	if (!event.body) {
		return JSON.stringify({
			message: 'requestBody is required.'
		});
	}
	if (!event.pathParameters || !event.pathParameters.todoId) {
		return JSON.stringify({
			message: 'todoId in pathParameters is required.'
		});
	}
	const requestBody: UpdateTodoParam = JSON.parse(event.body);
	const { title, content, expiration } = requestBody;
	if (!title || title === '') {
		return JSON.stringify({
			message: 'title in requestBody is required.'
		});
	} else if (!content || content === '') {
		return JSON.stringify({
			message: 'content in requestBody is required.'
		});
	} else if (!expiration || expiration === '') {
		return JSON.stringify({
			message: 'expiration in requestBody is required.'
		});
	} else {
		return undefined;
	}
};

const checkTargetRecordExists = async (
	client: DynamoDBClient,
	todoId: string
): Promise<GetItemCommandOutput> => {
	/**
	 * クエリ作成
	 */
	const param: GetItemCommandInput = {
		TableName: 'todos',
		Key: {
			Id: {
				S: todoId
			}
		}
	};
	const command = new GetItemCommand(param);

	/**
	 * データフェッチ
	 */
	const data: GetItemCommandOutput = await client.send(command);
	return data;
};

module.exports = { handler };
