import { FileInputReader } from '../../src/modules/io/inputReaders'
import fs from 'fs/promises'

describe('FileInputReader Integration Test', () => {
    const testFilePath = './test-input.txt'
    const testContent = 'test'

    beforeAll(async () => {
        console.error = jest.fn()
        await fs.writeFile(testFilePath, testContent, 'utf-8')
    })

    afterAll(async () => {
        await fs.unlink(testFilePath)
    })

    it('reads content from a file', async () => {
        const reader = new FileInputReader(testFilePath)
        const content = await reader.read()
        expect(content).toEqual(testContent)
    })

    it('returns an empty string if the file is not found', async () => {
        const reader = new FileInputReader('nonexistent-file.txt')
        const content = await reader.read()
        expect(content).toEqual('')
    })
})
