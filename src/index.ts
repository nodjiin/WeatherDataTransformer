import { Command } from 'commander'

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
