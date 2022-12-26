import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getAllRecords } from '../../../helpers/records'

// TODO: Get all TODO items for a current user
export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // Write your code here
        const records = await getAllRecords(event)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(records)
        }
    }
)

handler.use(
    cors({
        credentials: true
    })
)
