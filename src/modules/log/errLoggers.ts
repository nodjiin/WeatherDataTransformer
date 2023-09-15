export function safeLogError(err: unknown, baseMessage: string) {
    if (err instanceof Error) {
        console.error(`${baseMessage}: ${err.message}`)
    } else {
        console.error(`${baseMessage}`)
        console.error('Misshaped error') // TODO(AC) a real world scenario would require further logging.
    }
}
