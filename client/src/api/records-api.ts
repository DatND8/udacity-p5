import { CreateRecordRequest } from './../types/Record';
import Axios from 'axios'
import { apiEndpoint } from '../config'
import { RecordItem } from '../types/Record'

export async function getRecords(idToken: string): Promise<RecordItem[]> {
    console.log('Fetching records')

    const response = await Axios.get(`${apiEndpoint}/records`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        },
    })
    console.log('Records:', response.data)
    if (Object.keys(response.data.body).length === 0) {
        return []
    }
    return response.data.body
}

export async function createRecord(idToken: string, params: CreateRecordRequest) {
    const response = await Axios.post(`${apiEndpoint}/records`, JSON.stringify(params), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
    return response.data
}

export async function patchRecord(
    idToken: string,
    recordId: string,
    updatedReCordRequest: CreateRecordRequest
): Promise<{ title: string, description: string }> {
    const response = await Axios.patch(`${apiEndpoint}/records/${recordId}`, JSON.stringify(updatedReCordRequest), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
    return response.data
}

export async function deleteRecord(
    idToken: string,
    recordId: string
): Promise<void> {
    await Axios.delete(`${apiEndpoint}/records/${recordId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
        }
    })
}