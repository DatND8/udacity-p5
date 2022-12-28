import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteRecord } from '../../../bus/records'

export const handler = middy(
    async (
        event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
        const recordId = event.pathParameters.recordId
        await deleteRecord(recordId, event)
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: ''
        }
    }
)

handler
    .use(httpErrorHandler())
    .use(
        cors({
            credentials: true
        })
    )
