import { createRecords } from './../../../helpers/records';
import { CreateRecordRequest } from './../../../requests/CreateRecordRequest';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as uuid from 'uuid'
import { getUploadUrl } from '../../../helpers/attachmentUtils';

const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const newRecord: CreateRecordRequest = JSON.parse(event.body)

        // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
        const imageId = uuid();

        const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

        const createdRecord = await createRecords(newRecord, imageUrl, event)
        const url = getUploadUrl(imageId)

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                item: createdRecord,
                uploadImageS3Url: url
            })
        }
    }
)

handler.use(
    cors({
        credentials: true
    })
)
