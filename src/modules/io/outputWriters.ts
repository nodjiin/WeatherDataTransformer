import { OutputWriter } from '../../types/io'
import { safeLogError } from '../log/errLoggers'
import { safeParseFilename } from './inputParsers'
import fs from 'fs/promises'

export class FileOutputWriter implements OutputWriter {
    // I'm using process.cwd for the sake of simplicity here, on a real production environment
    // I would discuss and agree with the team for a safer default value
    readonly outputDir: string = process.env.OUTPUT_DIR || process.cwd()
    filePath: string | null

    constructor(fileName: string) {
        this.filePath = safeParseFilename(fileName, this.outputDir)
    }

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

export class StdoutOutputWriter implements OutputWriter {
    write(payload: string): Promise<boolean> {
        console.log(payload)
        return Promise.resolve(true)
    }
}
