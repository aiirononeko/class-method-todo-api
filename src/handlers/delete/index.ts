import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
	DeleteItemCommand,
	DeleteItemCommandInput,
	DynamoDBClient,
	DynamoDBClientConfig,
	GetItemCommand,
	GetItemCommandInput,
	GetItemCommandOutput
} from '@aws-sdk/client-dynamodb';

const handler = async (
	event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
	/**
	 * バリデーション
	 */
	if (!event.pathParameters || !event.pathParameters.todoId) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = {
			statusCode: 400,
			body: 'todoId in pathParameters is required.'
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
	const param: DeleteItemCommandInput = {
		TableName: 'todos',
		Key: {
			Id: {
				S: todoId
			}
		}
	};
	const command = new DeleteItemCommand(param);

	try {
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
