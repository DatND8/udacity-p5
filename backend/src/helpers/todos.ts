import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

// TODO: Implement businessLogic
export const getAllTodos = async (event) => {
    const userId = getUserId(event)
    return await todosAccess.getTodos(userId)
}

export const createTodo = async (createTodoRequest: CreateTodoRequest, event: APIGatewayProxyEvent) => {
    logger.info('Todo request', {
        createTodoRequest
    })

    const userId = getUserId(event)
    const itemId = uuid()

    const newTodo: TodoItem = {
        userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        attachmentUrl: '',
        done: false
    }

    logger.info('New todo', {
        newTodo
    })

    return await todosAccess.createTodo(newTodo)
}

export const updateTodo = async (updateTodoRequest: UpdateTodoRequest, todoId: string, event: APIGatewayProxyEvent) => {
    const userId = getUserId(event);
    await todosAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export const deleteTodo = async (todoId: string, event: APIGatewayProxyEvent) => {
    const userId = getUserId(event);
    await todosAccess.deleteTodo(userId, todoId)
}

export const createAttachmentPresignedUrl = async (todoId: string, url: string, event: APIGatewayProxyEvent) => {
    logger.info(`url: ${url} of todo: ${todoId}`)
    
    const userId = getUserId(event);
    await todosAccess.attachTodoUrl(todoId, userId, url)

    logger.info('createAttachmentPresignedUrl successfully')
} 