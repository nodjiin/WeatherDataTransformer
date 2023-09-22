import { CityWeather, LineSeriesWeatherChartData, WeatherData, WeatherDataPoint, WeatherInformation } from '../../types/dtos'

/**
 * Date object used for converting timestamps.
 */
const dateObj = new Date()

/**
 * Transforms the provided weather data into a format suitable for a line series chart.
 *
 * @param data - The weather information.
 * @param start - The start timestamp in milliseconds. If null the timestamp of the initial sample will be used instead.
 * @param end - The end timestamp in milliseconds. If null the timestamp of the final sample will be used instead.
 * @returns The transformed weather data.
 */
export function toLineSeriesChartFormat(data: WeatherInformation, start: number | null, end: number | null): LineSeriesWeatherChartData {
    const [startSeconds, endSeconds] = adjustRange(start, end, data)
    const totalHourPoints = (endSeconds - startSeconds) / 3600
    let outData: LineSeriesWeatherChartData = {}

    const cities = Object.keys(data)
    for (let i = 0; i < cities.length; i++) {
        const cityName = cities[i]
        outData[cityName] = transformCityWeather(data[cityName], startSeconds, endSeconds, totalHourPoints)
    }

    return outData
}

/**
 * Adjusts the provided time range, converting from milliseconds to seconds.
 * If no value has been provided for the start/end of the range this function will discover it by analysing the input data.
 *
 * @param start - The start timestamp in milliseconds.
 * @param end - The end timestamp in milliseconds.
 * @param data - The weather information.
 * @returns An array containing the adjusted start and end timestamps in seconds.
 */
function adjustRange(start: number | null, end: number | null, data: WeatherInformation): number[] {
    // if the range has not been fully specified, automatically discover it by looking at the input data
    if (start === null || end === null) {
        const [dataStart, dataEnd] = discoverRange(data)
        start = start === null ? dataStart : start / 1000
        end = end === null ? dataEnd : end / 1000
        end += 3600 // adjust end to include the last hour of data
    } else {
        //simply convert from milliseconds to seconds otherwise
        start /= 1000
        end /= 1000
    }

    // naive adjustment operations to To make sure we work with multiples of 3600
    let remainder = start % 3600
    if (remainder !== 0) {
        start -= remainder
    }

    remainder = end % 3600
    if (remainder !== 0) {
        end += 3600 - remainder
    }

    return [start, end]
}

/**
 * Iterates the entire data set provided to locate the first and last recorded samples.
 *
 * @param data - The weather information.
 * @returns An array containing the earliest and latest timestamps in the data.
 */
function discoverRange(data: WeatherInformation): number[] {
    const out = new Array<number>(2)
    out[0] = Number.MAX_SAFE_INTEGER
    out[1] = 0

    // NOTE The hourly data in the example provided are always sorted in ascending order.
    // If I could assume that the data used are always presented under such conditions
    // I would simply check the first and last elements of the arrays, and avoid the entire iteraton
    const cities = Object.keys(data)
    for (let i = 0; i < cities.length; i++) {
        const cityData = data[cities[i]]
        const hourlyData = cityData.hourly

        for (let j = 0; j < hourlyData.length; j++) {
            const timestamp = hourlyData[j].dt
            if (timestamp < out[0]) {
                out[0] = timestamp
            }

            if (timestamp > out[1]) {
                out[1] = timestamp
            }
        }
    }

    return out
}

/**
 * Transforms the weather data of a specific city into an array of data points for a line series chart.
 * Each datapoint correspond to the weather status of the city at a specific hour (e.g. 00:00 AM, 01:00 AM)
 *
 * @param data - The weather data of a city.
 * @param start - The start timestamp of the choosen range in seconds. Any sample taken before start will be discarded.
 * @param end - The end timestamp of the choose range in seconds. Any sample taken after end will be discarded.
 * @param size - The number of hours within the provided time range.
 * @returns  An array of data points.
 */
function transformCityWeather(data: CityWeather, start: number, end: number, size: number): WeatherDataPoint[] {
    const points: WeatherDataPoint[] = new Array(size)

    // initialize the array with null points
    let currentTs = start
    for (let i = 0; i < size; i++) {
        dateObj.setTime(currentTs * 1000)
        points[i] = {
            timestamp: dateObj.toISOString(),
            weather_condition: null,
        }

        currentTs += 3600
    }

    // iterate all the hourly items in data and fill the corresponding items in the array
    for (let i = 0; i < data.hourly.length; i++) {
        fillDataPoint(points, data.hourly[i], start, end)
    }

    // NOTE In the provided example the value of current is always repeated within the "hourly" array
    // I'm going to suppose that's a standard behaviour and ignore it. If that's not always the case an additional call
    // to fillDataPoint would address the current value
    // fillDataPoint(points, data.current, start, end)
    return points
}

/**
 * Populates the provided data points array with the weather data.
 *
 * @param points - The array of data points.
 * @param data - The weather data.
 * @param start - The start timestamp in seconds.
 * @param end - The end timestamp in seconds.
 */
function fillDataPoint(points: WeatherDataPoint[], data: WeatherData, start: number, end: number) {
    const timestamp = data.dt
    if (timestamp < start || timestamp >= end) {
        console.error(`Processing value outside of the given range: '${timestamp}'`)
        return
    }

    // NOTE since I don't have the full vision of the sampling practices and standard used, I'm going to use the naive assumption
    // that any timestamp which is not perfectly aligned with an hour value has to be discarded
    const relativeTimestamp = timestamp - start
    if (relativeTimestamp % 3600 != 0) {
        console.error(`Out of sync sample with timestamp '${timestamp}'.`)
        return
    }

    const index = relativeTimestamp / 3600
    points[index].weather_condition = {
        humidity: data.humidity,
        pressure: data.pressure,
        temperature: data.temp,
        wind_speed: data.wind_speed,
    }
}
