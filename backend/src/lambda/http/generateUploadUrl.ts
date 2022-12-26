import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUploadUrl } from '../../helpers/attachmentUtils'
import { createAttachmentPresignedUrl } from '../../helpers/todos'

// import { getUserId } from '../utils'
const bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const imageId = uuid();

    const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    await createAttachmentPresignedUrl(todoId, imageUrl, event)

    const url = getUploadUrl(imageId)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        uploadUrl: url
      })
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
