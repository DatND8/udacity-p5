import { RecordItem } from './../models/RecordItem';
import { CreateRecordRequest } from './../requests/CreateRecordRequest';
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { RecordsAccess } from './recordsAccess'

const recordsAccess = new RecordsAccess()
const logger = createLogger('records')

// TODO: Implement businessLogic
export const getAllRecords = async (event) => {
    const userId = getUserId(event)
    return await recordsAccess.getRecords(userId)
}


export const createRecords = async (createRecordRequest: CreateRecordRequest, imageUrl: string, event: APIGatewayProxyEvent) => {
    logger.info('Record request', {
        createRecordRequest
    })

    const userId = getUserId(event)
    const itemId = uuid()

    const newRecord: RecordItem = {
        userId,
        recordId: itemId,
        createdAt: new Date().toISOString(),
        title: createRecordRequest.title,
        attachmentUrl: imageUrl,
        description: createRecordRequest.description
    }

    logger.info('New record', {
        newRecord
    })

    return await recordsAccess.createRecord(newRecord)
}
