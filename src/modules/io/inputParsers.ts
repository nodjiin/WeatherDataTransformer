import path from 'path'
import { safeLogError } from '../log/errLoggers'
import { WeatherInformation, WeatherInformationSchema } from '../../types/dtos'

const allowedExtensions: string[] = process.env.ALLOWED_EXTENSIONS ? process.env.ALLOWED_EXTENSIONS.split(',') : ['.txt', '.json']
const forbiddenChars: string = process.env.FORBIDDEN_CHARS || `~!@$%^&*()=+[]{};:'"<>,?|`
// I'm using process.cwd for the sake of simplicity here, on a real production environment
// I would discuss and agree with the team a safer default value
const inputDir: string = process.env.INPUT_DIR || process.cwd()

function validateFileName(fileName: string): boolean {
    if (fileName === '' || fileName === null || typeof fileName !== 'string') {
        console.error(`Invalid filename value '${fileName}'.`)
        return false
    }

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
        safeLogError(err, `Error raised while trying to build the full path for the input file '${fileName}'`)
        return null
    }

    return fullPath
}

export function safeParseWeatherData(stringData: string): WeatherInformation | null {
    let rawObject
    try {
        rawObject = JSON.parse(stringData)
    } catch (err) {
        safeLogError(err, 'Error raised while trying to parse the input in a JSON object')
        return null
    }

    const validationResult = WeatherInformationSchema.safeParse(rawObject)
    if (validationResult.success) {
        return validationResult.data
    } else {
        safeLogError(validationResult.error, 'Error raised during input data parsing/validation')
        return null
    }
}
