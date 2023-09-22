import { OutputWriter } from '../../types/io'
import { safeLogError } from '../log/errLoggers'
import { safeParseFilename } from './inputParsers'
import fs from 'fs/promises'

/**
 * An output writer that writes data to a given file.
 * The output file will be stored in the directory specified by the environment variable `OUTPUT_DIR`, or
 * in the current working directory if `OUTPUT_DIR` has not been set.
 */
export class FileOutputWriter implements OutputWriter {
    // I'm using process.cwd for the sake of simplicity here, on a real production environment
    // I would discuss and agree with the team for a safer default value
    readonly outputDir: string = process.env.OUTPUT_DIR || process.cwd()
    filePath: string | null

    /**
     * @constructor
     *
     * @param fileName - The name of the output file.
     */
    constructor(fileName: string) {
        this.filePath = safeParseFilename(fileName, this.outputDir)
    }

    /**
     * Writes the provided payload to the output file. If the file already exist this function will override its content.
     *
     * @param payload - The data to be written to the file.
     * @returns Resolves with `true` if the write was successful, `false` otherwise.
     */
    async write(payload: string): Promise<boolean> {
        if (this.filePath === null) {
            return false
        }

        try {
            await fs.writeFile(this.filePath, payload, 'utf8')
            return true
        } catch (err) {
            safeLogError(err, `Error raised while trying to write output data to '${this.filePath}'.`)
            return false
        }
    }
}

/**
 * An output writer that writes data to the standard output.
 */
export class StdoutOutputWriter implements OutputWriter {
    /**
     * Writes the provided payload to the standard output.
     *
     * @param payload - The data to be written to stdout.
     * @returns Always resolves with `true`.
     */
    write(payload: string): Promise<boolean> {
        console.log(payload)
        return Promise.resolve(true)
    }
}
