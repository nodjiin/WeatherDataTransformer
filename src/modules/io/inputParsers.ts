import path from 'path'
import { safeLogError } from '../log/errLoggers'

function validateFileName(fileName: string): boolean {
    // TODO(AC) keep as default value and make configurable through an env variable
    const allowedExtensions = ['.txt', '.json']
    const forbiddenChars = ['~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '=', '+', '[', ']', '{', '}', ';', ':', "'", '"', '<', '>', ',', '?', '|']

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

    const inputDir = __dirname // TODO(AC) move to env variable, choose a safer default value
    let fullPath = null
    try {
        fullPath = path.join(inputDir, fileName)
    } catch (err) {
        safeLogError(err, `error raised while trying to build the full path for the input file '${err}'`)
        return null
    }

    return fullPath
}
