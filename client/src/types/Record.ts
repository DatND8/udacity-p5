export interface RecordItem {
    recordId: string
    createdAt: string
    title: string
    description: string
    attachmentUrl?: string
}

export interface CreateRecordRequest {
    title: string
    description: string
}
