import { StdoutOutputWriter } from '../../src/modules/io/outputWriters'

describe('StdoutOutputWriter', () => {
    it('should log payload to the console', async () => {
        const logMock = jest.fn()
        console.log = logMock
        const writer = new StdoutOutputWriter()
        await writer.write('test')

        expect(logMock).toHaveBeenCalledWith('test')
    })
})
