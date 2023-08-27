import { APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (
	statusCode: number,
	responseBody: string
): APIGatewayProxyResult => {
	const response: APIGatewayProxyResult = {
		statusCode: statusCode,
		headers: {
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
		},
		body: responseBody
	};
	return response;
};
