import { safeParseInputFilename, safeParseWeatherData } from '../../src/modules/io/inputParsers'

describe('inputParsers', () => {
    describe('safeParseInputFilename', () => {
        beforeEach(() => {
            console.error = jest.fn()
        })

        it('should return null for non-string values', () => {
            expect(safeParseInputFilename(123 as any)).toBeNull()
            expect(safeParseInputFilename(null as any)).toBeNull()
            expect(safeParseInputFilename(undefined as any)).toBeNull()
        })

        it('should reject file names with disallowed extensions', () => {
            const result = safeParseInputFilename('testfile.disallowed')
            expect(result).toBeNull()
        })

        it('should reject file names with forbidden characters', () => {
            const result = safeParseInputFilename('test~file.txt')
            expect(result).toBeNull()
        })

        it('should reject file names attempting directory traversal', () => {
            const result = safeParseInputFilename('../testfile.txt')
            expect(result).toBeNull()
        })

        it('should return full path for valid filenames', () => {
            const result = safeParseInputFilename('testfile.txt')
            expect(result).toContain('testfile.txt')
        })
    })

    describe('safeParseWeatherData', () => {
        it('should return parsed data for valid input', () => {
            const validInput = `{
                "cityName": {
                    "name": "City Name",
                    "lat": 1.0,
                    "lon": 1.0,
                    "timezone": "Timezone",
                    "timezone_offset": 1,
                    "current": {
                        "dt": 1,
                        "temp": 1,
                        "feels_like": 1,
                        "pressure": 1,
                        "humidity": 1,
                        "dew_point": 1,
                        "uvi": 1,
                        "clouds": 1,
                        "visibility": 1,
                        "wind_speed": 1,
                        "wind_deg": 1,
                        "weather": [{"id": 1, "main": "Main", "description": "Description", "icon": "Icon"}]
                    },
                    "hourly": [{
                        "dt": 1,
                        "temp": 1,
                        "feels_like": 1,
                        "pressure": 1,
                        "humidity": 1,
                        "dew_point": 1,
                        "uvi": 1,
                        "clouds": 1,
                        "visibility": 1,
                        "wind_speed": 1,
                        "wind_deg": 1,
                        "weather": [{"id": 1, "main": "Main", "description": "Description", "icon": "Icon"}]
                    }]
                }
            }`

            expect(safeParseWeatherData(validInput)).toBeTruthy()
        })

        it('should return null for invalid JSON input', () => {
            const invalidJson = `{ "key": "value"`
            expect(safeParseWeatherData(invalidJson)).toBeNull()
        })

        it('should return null for valid JSON but invalid weather data structure', () => {
            const invalidWeatherData = `{"cityName": {"name": "City Name"}}`
            expect(safeParseWeatherData(invalidWeatherData)).toBeNull()
        })
    })
})
