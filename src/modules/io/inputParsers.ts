import path from 'path'
import { safeLogError } from '../log/errLoggers'

const allowedExtensions: string[] = process.env.ALLOWED_EXTENSIONS ? process.env.ALLOWED_EXTENSIONS.split(',') : ['.txt', '.json']
const forbiddenChars: string = process.env.FORBIDDEN_CHARS || `~!@$%^&*()=+[]{};:'"<>,?|`
const inputDir: string = process.env.INPUT_DIR || __dirname // TODO(AC) safer default

function validateFileName(fileName: string): boolean {
    // check file extensions
    const fileExtension = path.extname(fileName).toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
        console.error(`File '${fileName}'with invalid extension '${fileExtension}'.`)
        return false
    }

    // check forbidden characters
    for (const char of forbiddenChars) {
        if (fileName.includes(char)) {
            console.error(`Filename '${fileName}' contains the forbidden character '${char}'.`)
            return false
        }
    }

    // check directory traversal
    if (fileName.includes('..')) {
        console.error('Invalid attempt of directory traversal.')
        return false
    }

    return true
}

export function safeParseInputFilename(fileName: string): string | null {
    if (!validateFileName(fileName)) {
        return null
    }

    let fullPath = null
    try {
        fullPath = path.join(inputDir, fileName)
    } catch (err) {
        safeLogError(err, `error raised while trying to build the full path for the input file '${err}'`)
        return null
    }

    return fullPath
}
