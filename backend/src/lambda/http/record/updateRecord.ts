import { updateRecord } from './../../../bus/records';
import { UpdateRecordRequest } from './../../../requests/UpdateRecordRequest';
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'


export const handler = middy(
    async (
        event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
        const recordId = event.pathParameters.recordId
        const updatedRecord: UpdateRecordRequest = JSON.parse(event.body)

        await updateRecord(updatedRecord, recordId, event)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(updatedRecord)
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
