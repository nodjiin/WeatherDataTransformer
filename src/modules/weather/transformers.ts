import { CityWeather, LineSeriesWeatherChartData, WeatherData, WeatherDataPoint, WeatherInformation } from '../../types/dtos'

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

function adjustRange(start: number | null, end: number | null, data: WeatherInformation): number[] {
    // if the range has not been fully specified, automatically discover it by looking at the input data
    if (start === null || end === null) {
        const [dataStart, dataEnd] = discoverRange(data)
        start = start === null ? dataStart : start / 1000
        end = end === null ? dataEnd : end / 1000
    } else {
        //simply convert from milliseconds to seconds otherwise
        start /= 1000
        end /= 1000
    }

    return [start, end]
}

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
    out[1] += 3600 // adjust to fully include the last recorded hour

    return out
}

function transformCityWeather(data: CityWeather, start: number, end: number, size: number): WeatherDataPoint[] {
    const points: WeatherDataPoint[] = new Array(size)

    // initialize the array with null points
    let currentTs = start
    for (let i = 0; i < size; i++) {
        points[i] = {
            timestamp: currentTs,
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

function fillDataPoint(points: WeatherDataPoint[], data: WeatherData, start: number, end: number) {
    const timestamp = data.dt
    if (timestamp < start || timestamp > end) {
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
