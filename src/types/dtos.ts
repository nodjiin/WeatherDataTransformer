import { z } from 'zod'

const WeatherSchema = z.object({
    id: z.number(),
    main: z.string(),
    description: z.string(),
    icon: z.string(),
})

const WeatherDataSchema = z.object({
    dt: z.number(),
    sunrise: z.optional(z.number()),
    sunset: z.optional(z.number()),
    temp: z.number(),
    feels_like: z.number(),
    pressure: z.number(),
    humidity: z.number(),
    dew_point: z.number(),
    uvi: z.number(),
    clouds: z.number(),
    visibility: z.number(),
    wind_speed: z.number(),
    wind_deg: z.number(),
    weather: z.array(WeatherSchema),
})

const CityWeatherSchema = z.object({
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
    timezone: z.string(),
    timezone_offset: z.number(),
    current: WeatherDataSchema,
    hourly: z.array(WeatherDataSchema),
})

export const WeatherInformationSchema = z.record(CityWeatherSchema)

export type Weather = z.infer<typeof WeatherSchema>
export type WeatherData = z.infer<typeof WeatherDataSchema>
export type CityWeather = z.infer<typeof CityWeatherSchema>
export type WeatherInformation = z.infer<typeof WeatherInformationSchema>
