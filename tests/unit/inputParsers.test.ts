import { safeParseInputDate, safeParseFilename, safeParseWeatherData } from '../../src/modules/io/inputParsers'

describe('inputParsers', () => {
    const dirname = 'testdir'
    beforeEach(() => {
        console.error = jest.fn()
    })
    describe('safeParseInputFilename', () => {
        it('should return null for non-string values', () => {
            expect(safeParseFilename(123 as any, dirname)).toBeNull()
            expect(safeParseFilename(null as any, dirname)).toBeNull()
            expect(safeParseFilename(undefined as any, dirname)).toBeNull()
        })

        it('should reject file names with disallowed extensions', () => {
            const result = safeParseFilename('testfile.disallowed', dirname)
            expect(result).toBeNull()
        })

        it('should reject file names with forbidden characters', () => {
            const result = safeParseFilename('test~file.txt', dirname)
            expect(result).toBeNull()
        })

        it('should reject file names attempting directory traversal', () => {
            const result = safeParseFilename('../testfile.txt', dirname)
            expect(result).toBeNull()
        })

        it('should return full path for valid filenames', () => {
            const result = safeParseFilename('testfile.txt', dirname)
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

        it('should return empty object for invalid JSON input', () => {
            const invalidJson = `{ "key": "value"`
            const result = safeParseWeatherData(invalidJson)
            expect(Object.keys(result).length).toBe(0)
        })

        it('should return empty object for valid JSON but invalid weather data structure', () => {
            const invalidWeatherData = `{"cityName": {"name": "City Name"}}`
            const result = safeParseWeatherData(invalidWeatherData)
            expect(Object.keys(result).length).toBe(0)
        })
    })

    describe('safeParseInputDate', () => {
        it('should return null for an empty string', () => {
            const result = safeParseInputDate('')
            expect(result).toBeNull()
        })

        it('should return null for an invalid date string', () => {
            const result = safeParseInputDate('2023-25-25 25:60 AM')
            expect(result).toBeNull()
        })

        it('should return timestamp for a valid date string', () => {
            const validDateString = '2023-09-15 10:00 AM'
            const expectedTimestamp = 1694743200000
            const result = safeParseInputDate(validDateString)
            expect(result).toBe(expectedTimestamp)
        })
    })
})
