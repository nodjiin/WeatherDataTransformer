import { toLineSeriesChartFormat } from '../../src/modules/weather/transformers'
import { WeatherCondition, WeatherInformation } from '../../src/types/dtos'

describe('toLineSeriesChartFormat', () => {
    beforeAll(() => {
        console.error = jest.fn()
    })

    const mockData: WeatherInformation = {
        City1: {
            name: 'City1',
            lat: 123,
            lon: 456,
            timezone: 'UTC',
            timezone_offset: 0,
            current: {
                dt: 3600,
                temp: 22,
                feels_like: 21,
                pressure: 1011,
                humidity: 65,
                dew_point: 15,
                uvi: 1,
                clouds: 10,
                visibility: 10000,
                wind_speed: 3,
                wind_deg: 100,
                weather: [{ id: 1, main: 'Clear', description: 'Clear Sky', icon: '01d' }],
            },
            hourly: [
                {
                    dt: 3600,
                    temp: 22,
                    feels_like: 21,
                    pressure: 1011,
                    humidity: 65,
                    dew_point: 15,
                    uvi: 1,
                    clouds: 10,
                    visibility: 10000,
                    wind_speed: 3,
                    wind_deg: 100,
                    weather: [{ id: 1, main: 'Clear', description: 'Clear Sky', icon: '01d' }],
                },
                {
                    dt: 7200,
                    temp: 23,
                    feels_like: 22,
                    pressure: 1012,
                    humidity: 64,
                    dew_point: 16,
                    uvi: 1,
                    clouds: 9,
                    visibility: 10000,
                    wind_speed: 3.5,
                    wind_deg: 105,
                    weather: [{ id: 1, main: 'Clear', description: 'Clear Sky', icon: '01d' }],
                },
                {
                    dt: 10800,
                    temp: 23,
                    feels_like: 22,
                    pressure: 1012,
                    humidity: 64,
                    dew_point: 16,
                    uvi: 1,
                    clouds: 9,
                    visibility: 10000,
                    wind_speed: 3.5,
                    wind_deg: 105,
                    weather: [{ id: 1, main: 'Clear', description: 'Clear Sky', icon: '01d' }],
                },
            ],
        },
    }

    const isoDate1 = '1970-01-01T01:00:00.000Z'
    const isoDate2 = '1970-01-01T02:00:00.000Z'
    const isoDate3 = '1970-01-01T03:00:00.000Z'

    const expectedWeather1: WeatherCondition = {
        wind_speed: 3,
        humidity: 65,
        pressure: 1011,
        temperature: 22,
    }

    const expectedWeather2: WeatherCondition = {
        wind_speed: 3.5,
        humidity: 64,
        pressure: 1012,
        temperature: 23,
    }

    it('should transform data in the given interval', () => {
        const result = toLineSeriesChartFormat(mockData, 3600 * 1000, 10800 * 1000)
        expect(result).toHaveProperty('City1')
        expect(result.City1.length).toBe(2)
        expect(result.City1[0].timestamp).toBe(isoDate1)
        expect(result.City1[0].weather_condition).toEqual(expectedWeather1)
        expect(result.City1[1].timestamp).toBe(isoDate2)
        expect(result.City1[1].weather_condition).toEqual(expectedWeather2)
    })

    it('should handle missing start and end parameters', () => {
        const result = toLineSeriesChartFormat(mockData, null, null)
        expect(result).toHaveProperty('City1')
        expect(result.City1.length).toBe(3)
        expect(result.City1[0].timestamp).toBe(isoDate1)
        expect(result.City1[1].timestamp).toBe(isoDate2)
        expect(result.City1[2].timestamp).toBe(isoDate3)
    })

    it('should handle missing end parameter', () => {
        const result = toLineSeriesChartFormat(mockData, 7200 * 1000, null)
        expect(result).toHaveProperty('City1')
        expect(result.City1.length).toBe(2)
        expect(result.City1[0].timestamp).toBe(isoDate2)
        expect(result.City1[1].timestamp).toBe(isoDate3)
    })

    it('should handle missing start parameter', () => {
        const result = toLineSeriesChartFormat(mockData, null, 7200 * 1000)
        expect(result).toHaveProperty('City1')
        expect(result.City1.length).toBe(2)
        expect(result.City1[0].timestamp).toBe(isoDate1)
        expect(result.City1[1].timestamp).toBe(isoDate2)
    })

    it('should log warning for processing value outside of the given range', () => {
        toLineSeriesChartFormat(mockData, 10000 * 1000, 20000 * 1000)
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Processing value outside of the given range'))
    })

    it('should log warning for out-of-sync sample timestamp', () => {
        const misalignedData = { ...mockData }
        misalignedData.City1.hourly[0].dt = 3650

        toLineSeriesChartFormat(misalignedData, null, null)
        expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Out of sync sample with timestamp'))
    })
})
