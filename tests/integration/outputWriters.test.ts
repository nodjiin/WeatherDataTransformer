import fs from 'fs/promises'
import path from 'path'
import { FileOutputWriter } from '../../src/modules/io/outputWriters'

describe('FileOutputWriter Integration Tests', () => {
    const testOutputDir: string = path.join(__dirname, 'test-output')
    process.env.OUTPUT_DIR = testOutputDir

    beforeAll(async () => {
        try {
            await fs.access(testOutputDir)
        } catch (err) {
            await fs.mkdir(testOutputDir)
        }

        console.error = jest.fn()
    })

    afterAll(async () => {
        await fs.rm(testOutputDir, { recursive: true, force: true })
        delete process.env.OUTPUT_DIR
    })

    it('should write data to a file when given a valid filename', async () => {
        const validFileName: string = 'test.txt'
        const testPayload: string = 'Integration Test Data'

        const writer = new FileOutputWriter(validFileName)
        await writer.write(testPayload)

        const writtenData: string = await fs.readFile(path.join(testOutputDir, validFileName), 'utf8')
        expect(writtenData).toBe(testPayload)
    })

    it('should not write data for an invalid filename', async () => {
        const invalidFileName: string = 'test..txt'
        const testPayload: string = 'Test'

        const writer = new FileOutputWriter(invalidFileName)
        await writer.write(testPayload)
        await expect(fs.access(path.join(testOutputDir, invalidFileName))).rejects.toThrow()
    })
})
