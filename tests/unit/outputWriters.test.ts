import { StdoutOutputWriter } from '../../src/modules/io/outputWriters'

describe('StdoutOutputWriter', () => {
    it('should log payload to the console and return true', async () => {
        const logMock = jest.fn()
        console.log = logMock
        const writer = new StdoutOutputWriter()

        const result = await writer.write('test')

        expect(result).toBe(true)
        expect(logMock).toHaveBeenCalledWith('test')
    })
})
