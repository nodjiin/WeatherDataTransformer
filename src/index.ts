import { Command } from 'commander'
import { InputReader } from './types/io'
import { FileInputReader, StdinInputReader } from './modules/io/inputReaders'
import { safeParseInputDate, safeParseWeatherData } from './modules/io/inputParsers'
import { toLineSeriesChartFormat } from './modules/weather/transformers'
import { LineSeriesWeatherChartData } from './types/dtos'

async function main() {
    const program = new Command()

    program
        .name('WeatherDataTransformer')
        .version('1.0.0')
        .description('Tool to transform a set of weather data over a given period.')
        .option('-s, --start_range <string>', 'Start time for the range of data to process. Format: "YYYY-MM-DD hh:mm A".', '')
        .option('-e, --end_range <string>', 'Start time for the range of data to process. Format: "YYYY-MM-DD hh:mm A".', '')
        .option('-i, --input_file <string>', 'Input file for processing. If not specified will read from stdin.', '')
        .option('-o, --output_file <string>', 'Output file after processing. If not specified will write to stdout.', '')
        .parse(process.argv)

    const options = program.opts()

    const inReader: InputReader = options.input_file !== '' ? new FileInputReader(options.input_file) : new StdinInputReader()
    const dataString = await inReader.read()
    const weatherData = safeParseWeatherData(dataString)
    const startRange = safeParseInputDate(options.start_range)
    const endRange = safeParseInputDate(options.end_range)
    const outData = toLineSeriesChartFormat(weatherData, startRange, endRange)

    // TODO(AC) safely parse the remaining options
    // TODO(AC) write output to file or stdout
    // TODO(AC) unit tests the transformer function
}

main()
