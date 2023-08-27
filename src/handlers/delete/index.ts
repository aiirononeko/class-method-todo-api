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
import { createResponse } from '../../utils/createResponse';

const handler = async (
	event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
	/**
	 * バリデーション
	 */
	if (!event.pathParameters || !event.pathParameters.taskId) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = createResponse(
			400,
			'taskId in pathParameters is required.'
		);
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
	const taskId = event.pathParameters?.taskId ?? '';
	const targetData = await checkTargetRecordExists(client, taskId);
	if (!targetData.Item) {
		/**
		 * レスポンス
		 */
		const response: APIGatewayProxyResult = createResponse(404, '');
		return response;
	}

	/**
	 * クエリ作成
	 */
	const param: DeleteItemCommandInput = {
		TableName: 'tasks',
		Key: {
			Id: {
				S: taskId
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
		const response: APIGatewayProxyResult = createResponse(200, '');
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

const checkTargetRecordExists = async (
	client: DynamoDBClient,
	taskId: string
): Promise<GetItemCommandOutput> => {
	/**
	 * クエリ作成
	 */
	const param: GetItemCommandInput = {
		TableName: 'tasks',
		Key: {
			Id: {
				S: taskId
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
