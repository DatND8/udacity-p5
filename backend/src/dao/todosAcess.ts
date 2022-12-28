import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'


const logger = createLogger('TodosAccess')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIdIndex = process.env.TODOS_CREATED_AT_INDEX
    ) { }

    async getTodos(userId: string) {
        logger.info('userId: ', userId)
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIdIndex,
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

    async createTodo(todo: TodoItem) {
        try {
            await this.docClient.put({
                TableName: this.todosTable,
                Item: todo
            }).promise()

            return todo
        } catch (error) {
            logger.error('Error create todo: ', error)
        }
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info(`Deleting a todo with id: ${todoId}`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
    }

    async updateTodo(todoId: string, userId: string, todo: TodoUpdate) {
        logger.info(`Updating a todo with id: ${todoId}`)
        try {
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                },
                UpdateExpression: 'set #nameTodo = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeValues: {
                    ':name': todo.name,
                    ':dueDate': todo.dueDate,
                    ':done': todo.done
                },
                ExpressionAttributeNames: {
                    '#nameTodo': 'name'
                }
            }).promise();

        } catch (error) {
            logger.error('Error update todo: ', error)
        }
    }

    async attachTodoUrl(todoId: string, userId: string, url: string) {
        logger.info('Process attachTodoUrl')
        try {
            await this.docClient.update({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                },
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                    ':attachmentUrl': url
                }
            }).promise()
        } catch (error) {
            logger.error('attachTodoUrl failed: ', error)
        }
    }
}