import { InputReader } from '../../types/io'
import fs from 'fs/promises'
import { safeParseInputFilename } from './inputParsers'
import { safeLogError } from '../log/errLoggers'

export class FileInputReader implements InputReader {
    filePath: string | null

    constructor(fileName: string) {
        this.filePath = safeParseInputFilename(fileName)
    }

    async read(): Promise<string> {
        if (this.filePath === null) {
            return ''
        }

        try {
            const data = await fs.readFile(this.filePath, 'utf-8') // TODO(AC) a real scenario might need a flag to specify a different encoding
            return data
        } catch (err) {
            safeLogError(err, `Error while reading file '${this.filePath}'`)
            return ''
        }
    }
}

export class StdinInputReader implements InputReader {
    read(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let data = ''
            process.stdin.setEncoding('utf8') // TODO(AC) again, utf8 might be a naive supposition
            process.stdin.on('readable', () => {
                let chunk: string | Buffer
                while ((chunk = process.stdin.read()) !== null) {
                    data += chunk
                }
            })

            process.stdin.on('end', () => {
                resolve(data)
            })

            process.stdin.on('error', (error) => {
                reject(error)
            })
        })
    }
}
