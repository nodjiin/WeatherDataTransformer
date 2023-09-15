import { safeLogError } from '../../src/modules/log/errLoggers'

describe('safeLogError', () => {
    let mockError: jest.SpyInstance
    beforeEach(() => {
        mockError = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        mockError.mockRestore()
    })

    it('should log the base message followed by the error message for Error instances', () => {
        const error = new Error('This is an error message.')
        const baseMessage = 'An error occurred'

        safeLogError(error, baseMessage)

        expect(mockError).toHaveBeenCalledWith('An error occurred: This is an error message.')
    })

    // not too interesting with the current naive approach
    it('should log the base message and "Misshaped error" for non-Error types', () => {
        const error = { some: 'object' }
        const baseMessage = 'An error occurred'

        safeLogError(error, baseMessage)

        expect(mockError).toHaveBeenCalledWith('An error occurred')
        expect(mockError).toHaveBeenCalledWith('Misshaped error')
    })

    it('should only log the base message and "Misshaped error" for undefined or null errors', () => {
        const baseMessage = 'An error occurred'

        safeLogError(undefined, baseMessage)

        expect(mockError).toHaveBeenCalledWith('An error occurred')
        expect(mockError).toHaveBeenCalledWith('Misshaped error')
    })
})
