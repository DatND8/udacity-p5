import React from "react";
import { Button, Container, Divider, Form, Grid, Header, Image, Modal } from "semantic-ui-react";
import Auth from "../auth/Auth";
import { CreateRecordRequest, RecordItem } from "../types/Record";
import { History } from 'history'
import { UploadState } from "./EditTodo";
import { getUploadUrl, uploadFile } from "../api/todos-api";
import { createRecord, getRecords } from "../api/records-api";

interface RecordsProps {
    auth: Auth
    history: History
}

interface RecordsState {
    records: RecordItem[]
    newRecordTitle: string,
    newRecordDescription: string,
    loadingRecords: boolean,
    addRecordModalOpen: boolean,
    uploadState: UploadState,
    file: any
}

export class Records extends React.PureComponent<RecordsProps, RecordsState> {
    state: RecordsState = {
        records: [],
        newRecordTitle: '',
        newRecordDescription: '',
        loadingRecords: false,
        addRecordModalOpen: false,
        uploadState: UploadState.NoUpload,
        file: undefined
    }

    async componentDidMount() {
        const response = await getRecords(this.props.auth.getIdToken())
        this.setState({
            records: response
        })
    }

    setOpen = (isOpen: boolean) => {
        this.setState({
            addRecordModalOpen: isOpen
        })
    }

    setUploadState(uploadState: UploadState) {
        this.setState({
            uploadState
        })
    }


    handleSubmit = async (event: React.SyntheticEvent) => {
        try {
            if (!this.state.file) {
                alert('File should be selected')
                return
            }

            this.setUploadState(UploadState.FetchingPresignedUrl)

            const params: CreateRecordRequest = {
                title: this.state.newRecordTitle,
                description: this.state.newRecordDescription
            }

            const newRecord = await createRecord(this.props.auth.getIdToken(), params)
            this.setUploadState(UploadState.UploadingFile)
            await uploadFile(newRecord.uploadImageS3Url, this.state.file)

            this.setState({
                records: [
                    ...this.state.records,
                    newRecord.item
                ]
            })
            alert('File was uploaded!')
        } catch (e) {
            alert('Could not upload a file: ' + (e as Error).message)
        } finally {
            this.setOpen(false)
            this.setUploadState(UploadState.NoUpload)
        }
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        this.setState({
            file: files[0]
        })
    }

    handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newRecordTitle: event.target.value
        })
    }

    handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newRecordDescription: event.target.value
        })
    }

    renderRecords = () => {
        if (this.state.records.length > 0) {
            return this.state.records.map((r) => {
                return (
                    <React.Fragment key={r.recordId}>
                        <Grid.Row centered >
                            <Header as="h3">{r.title}</Header>
                        </Grid.Row>
                        <Grid.Row>
                            <Image src={r.attachmentUrl} size="small" wrapped />
                        </Grid.Row>
                        <Grid.Row>
                            <div>
                                <p>{r.description}</p>
                            </div>
                        </Grid.Row>
                        <Divider horizontal>.</Divider>
                    </React.Fragment>
                )
            })
        }
        else {
            return <React.Fragment></React.Fragment>
        }
    }

    render() {
        return (
            <div >
                <Grid.Row>
                    <Header as="h1">Records</Header>
                    <Modal
                        onClose={() => this.setOpen(false)}
                        onOpen={() => this.setOpen(true)}
                        open={this.state.addRecordModalOpen}
                        trigger={<Button>Add Record</Button>}
                    >
                        <Modal.Header>Select a Photo</Modal.Header>
                        <Modal.Content>
                            <Form onSubmit={this.handleSubmit}>
                                <Form.Field>
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        onChange={this.handleTitleChange}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        onChange={this.handleDescriptionChange}
                                    />
                                </Form.Field>

                                <Form.Field>
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        placeholder="Image to upload"
                                        onChange={this.handleFileChange}
                                    />
                                </Form.Field>
                            </Form>
                        </Modal.Content>
                        <Modal.Actions>
                            {this.renderButton()}
                        </Modal.Actions>
                    </Modal>
                </Grid.Row>
                <Container textAlign="center" fluid>
                    <Grid centered padded>
                        {this.renderRecords()}
                    </Grid>
                </Container>
            </div>
        )
    }

    renderButton() {
        return (
            <React.Fragment>
                {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
                {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
                <Button
                    primary
                    loading={this.state.uploadState !== UploadState.NoUpload}
                    onClick={(e) => this.handleSubmit(e)}
                >
                    Upload
                </Button>
            </React.Fragment>
        )
    }
}