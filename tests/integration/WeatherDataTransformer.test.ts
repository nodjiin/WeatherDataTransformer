import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs/promises'

describe('Full WeatherDataTransformer flow test', () => {
    const scriptPath = path.resolve(__dirname, '../../dist/index.js')
    it('should read from stdin and write to stdout', async () => {
        const inputData = await fs.readFile(path.join(__dirname, '../data/weather.json'), 'utf8')
        const outputData = await fs.readFile(path.join(__dirname, '../data/out.json'), 'utf8')
        const formattedOutput = JSON.stringify(JSON.parse(outputData)) + '\n'

        const output = execSync(`node ${scriptPath}`, { encoding: 'utf8', input: inputData })

        expect(output).toBe(formattedOutput)
    })

    // Add other scenarios similarly...
})
