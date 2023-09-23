import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

describe('Full WeatherDataTransformer flow test', () => {
    const scriptPath = path.resolve(__dirname, '../../dist/index.js')
    const testOutputDir = path.join(__dirname, 'test-output-full')
    let inputData: string
    let formattedOutput: string
    const outputFile = 'testOutput.json'
    const inputFile = './tests/data/weather.json'
    const outputPath = path.join(testOutputDir, outputFile)

    beforeAll(async () => {
        try {
            await fs.access(testOutputDir)
        } catch (err) {
            await fs.mkdir(testOutputDir)
        }

        process.env.OUTPUT_DIR = testOutputDir
        console.error = jest.fn()
        inputData = await fs.readFile(path.join(__dirname, '../data/weather.json'), 'utf8')
        const outputData = await fs.readFile(path.join(__dirname, '../data/out.json'), 'utf8')
        formattedOutput = JSON.stringify(JSON.parse(outputData))
    })

    afterEach(async () => {
        try {
            await fs.unlink(outputPath)
        } catch (err) {}
    })

    afterAll(async () => {
        await fs.rm(testOutputDir, { recursive: true, force: true })
        delete process.env.OUTPUT_DIR
    })

    it('should read from stdin and write to stdout', async () => {
        const output = execSync(`node ${scriptPath}`, { encoding: 'utf8', input: inputData })

        expect(output).toBe(formattedOutput + '\n')
    })

    it('should read from stdin and write to file', async () => {
        execSync(`node ${scriptPath} -o ${outputFile}`, { encoding: 'utf8', input: inputData, env: process.env })
        const output = await fs.readFile(outputPath, 'utf8')

        expect(output).toBe(formattedOutput)
    })

    it('should read from file and write to file', async () => {
        execSync(`node ${scriptPath} -i ${inputFile} -o ${outputFile}`, { encoding: 'utf8', env: process.env })
        const output = await fs.readFile(outputPath, 'utf8')

        expect(output).toBe(formattedOutput)
    })

    it('should read from file and write to stdout', async () => {
        const output = execSync(`node ${scriptPath} -i ${inputFile}`, { encoding: 'utf8' })

        expect(output).toBe(formattedOutput + '\n')
    })
})
