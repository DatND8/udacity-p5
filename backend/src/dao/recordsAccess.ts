import { UpdateRecordRequest } from './../requests/UpdateRecordRequest';
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'
import { RecordItem } from '../models/RecordItem'
import { createLogger } from '../utils/logger'


const logger = createLogger('RecordsAccess')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic
export class RecordsAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly recordsTable = process.env.RECORDS_TABLE,
        private readonly recordsIdIndex = process.env.RECORDS_CREATED_AT_INDEX
    ) { }

    async getRecords(userId: string) {
        logger.info('userId: ', userId)
        const result = await this.docClient.query({
            TableName: this.recordsTable,
            IndexName: this.recordsIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        if (result.Count !== 0) {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: result.Items
            }
        }

        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: ''
        }
    }

    async createRecord(record: RecordItem) {
        try {
            await this.docClient.put({
                TableName: this.recordsTable,
                Item: record
            }).promise()

            return record
        } catch (error) {
            logger.error('Error create record: ', error)
        }
    }

    async updateRecord(recordId: string, userId: string, record: UpdateRecordRequest) {
        logger.info(`Updating a record with id: ${recordId}`)
        try {
            await this.docClient.update({
                TableName: this.recordsTable,
                Key: {
                    userId,
                    recordId
                },
                UpdateExpression: 'set title = :title, description = :description',
                ExpressionAttributeValues: {
                    ':title': record.title,
                    ':description': record.description,
                },
            }).promise();

        } catch (error) {
            logger.error('Error update record: ', error)
        }
    }

    async deleteRecord(userId: string, recordId: string) {
        logger.info(`Deleting a record with id: ${recordId}`)
        await this.docClient.delete({
            TableName: this.recordsTable,
            Key: {
                userId,
                recordId
            }
        }).promise()
    }

}