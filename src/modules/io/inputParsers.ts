import path from 'path'
import { safeLogError } from '../log/errLoggers'
import { WeatherInformation, WeatherInformationSchema } from '../../types/dtos'
import moment from 'moment'

/**
 * Allowed files extensions, sourced from the environment variable `ALLOWED_EXTENSIONS`or defaulting to `.txt` and `.json`.
 */
const allowedExtensions: string[] = process.env.ALLOWED_EXTENSIONS ? process.env.ALLOWED_EXTENSIONS.split(',') : ['.txt', '.json']

/**
 * Characters forbidden in file names, sourced from the environment variable `FORBIDDEN_CHARS` or defaulting to `~!@$%^&*()=+[]{};:'"<>,?|`
 */
const forbiddenChars: string = process.env.FORBIDDEN_CHARS || `~!@$%^&*()=+[]{};:'"<>,?|`

/**
 * Validates a given file name based on allowed extensions and forbidden characters.
 *
 * @param fileName - The name of the file to validate.
 * @returns Returns `true` if the file name is valid, `false` otherwise.
 */
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

/**
 * Constructs a safe file path based on the file name and a safe directory.
 * It validates the file name before proceeding.
 *
 * @param fileName - The name of the file.
 * @param safeDir - The directory to combine with the file name.
 * @returns Returns the constructed file path if valid, or `null` if there was an error or invalid file name.
 */
export function safeParseFilename(fileName: string, safeDir: string): string | null {
    if (!validateFileName(fileName)) {
        return null
    }

    try {
        return path.join(safeDir, fileName)
    } catch (err) {
        safeLogError(err, `Error raised while trying to build the full path for the input file '${fileName}'`)
        return null
    }
}

/**
 * Attempts to parse a string into a valid `WeatherInformation` object.
 *
 * @param stringData - Raw string data that should be parsed into a weather information object.
 * @returns Returns a `WeatherInformation` object if valid, or `null` if there was a parsing/validation error.
 */
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

/**
 * Date format for parsing input dates, sourced from the environment variable `INPUT_DATE_FORMAT_STRING` or defaulted to 'YYYY-MM-DD HH:mm A'.
 */
const inputDateFormatString: string = process.env.INPUT_DATE_FORMAT_STRING || 'YYYY-MM-DD HH:mm A'

/**
 * Parses an input date string and converts it into a timestamp.
 *
 * @param dateString - The input date string to parse.
 * @returns Returns a timestamp if the date string is valid, or `null` if it's invalid.
 */
export function safeParseInputDate(dateString: string): number | null {
    if (dateString === '') {
        return null
    }

    // given the nature of the task I am following the assumption that the range value is provided in UTC format.
    // This assumption may be naive and requires further investigation
    const date = moment.utc(dateString, inputDateFormatString)
    if (!date.isValid()) {
        //skipping checks on moment error flags for brevity
        console.error(`Invalid input date '${dateString}'. Expected format ${inputDateFormatString}`)
        return null
    }

    return date.valueOf()
}
