/**
 * Safely logs errors to the console. Handles both instances of `Error` and other error formats.
 *
 * @function
 * @param {unknown} err - The error object or value to log.
 * @param {string} baseMessage - The base message to prepend to the error message.
 */
export function safeLogError(err: unknown, baseMessage: string) {
    if (err instanceof Error) {
        console.error(`${baseMessage}: ${err.message}`)
    } else {
        console.error(`${baseMessage}`)
        console.error('Misshaped error') // TODO(AC) a real world scenario would require further logging.
    }
}
