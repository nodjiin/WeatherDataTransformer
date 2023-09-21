export interface InputReader {
    read(): Promise<string>
}

export interface OutputWriter {
    write(payload: string): Promise<void>
}
