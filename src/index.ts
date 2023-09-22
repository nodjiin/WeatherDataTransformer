import { Command } from 'commander'
import { InputReader, OutputWriter } from './types/io'
import { FileInputReader, StdinInputReader } from './modules/io/inputReaders'
import { safeParseInputDate, safeParseWeatherData } from './modules/io/inputParsers'
import { toLineSeriesChartFormat } from './modules/weather/transformers'
import { FileOutputWriter, StdoutOutputWriter } from './modules/io/outputWriters'

enum ErrorCodes {
    INPUT_READ_FAILURE = 1000,
    INVALID_INPUT = 1001,
    OUTPUT_WRITE_FAILURE = 1002,
}

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

    // read and parse
    const inReader: InputReader = options.input_file !== '' ? new FileInputReader(options.input_file) : new StdinInputReader()
    const dataString = await inReader.read()
    if (dataString === '') {
        process.exit(ErrorCodes.INPUT_READ_FAILURE)
    }

    const weatherData = safeParseWeatherData(dataString)
    if (weatherData === null) {
        process.exit(ErrorCodes.INVALID_INPUT)
    }

    // transform
    const startRange = safeParseInputDate(options.start_range)
    const endRange = safeParseInputDate(options.end_range)
    const outData = toLineSeriesChartFormat(weatherData, startRange, endRange)

    // write
    const outWriter: OutputWriter = options.output_file !== '' ? new FileOutputWriter(options.input_file) : new StdoutOutputWriter()
    const writeSuccess = await outWriter.write(JSON.stringify(outData))
    if (!writeSuccess) {
        process.exit(ErrorCodes.OUTPUT_WRITE_FAILURE)
    }
}

main()
