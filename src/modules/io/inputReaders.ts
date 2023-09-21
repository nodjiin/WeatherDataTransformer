import { InputReader } from '../../types/io'
import fs from 'fs/promises'
import { safeParseFilename } from './inputParsers'
import { safeLogError } from '../log/errLoggers'

export class FileInputReader implements InputReader {
    // I'm using process.cwd for the sake of simplicity here, on a real production environment
    // I would discuss and agree with the team for a safer default value
    readonly inputDir: string = process.env.INPUT_DIR || process.cwd()
    filePath: string | null

    constructor(fileName: string) {
        this.filePath = safeParseFilename(fileName, this.inputDir)
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
