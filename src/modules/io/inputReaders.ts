import { InputReader } from '../../types/io'
import fs from 'fs/promises'
import { safeParseFilename } from './inputParsers'
import { safeLogError } from '../log/errLoggers'

/**
 * An input reader that reads data from a given file.
 * The class is expecting the input file to be stored in the directory specified by the environment variable `INPUT_DIR`, or
 * in the current working directory if `INPUT_DIR` has not been set.
 */
export class FileInputReader implements InputReader {
    // I'm using process.cwd for the sake of simplicity here, on a real production environment
    // I would discuss and agree with the team for a safer default value
    readonly inputDir: string = process.env.INPUT_DIR || process.cwd()
    filePath: string | null

    /**
     * @constructor
     *
     * @param fileName - The name of the input file.
     */
    constructor(fileName: string) {
        this.filePath = safeParseFilename(fileName, this.inputDir)
    }

    /**
     * Reads the content of the specified input file.
     *
     * @returns Resolves with the content of the file or an empty string in case of errors.
     */
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

/**
 * An input reader that reads data from the standard input (stdin).
 */
export class StdinInputReader implements InputReader {
    /**
     * Reads data from the standard input (stdin) until it ends.
     *
     * @returns Resolves with the content read from stdin.
     */
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
