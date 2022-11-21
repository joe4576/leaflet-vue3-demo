const apiKey = import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY;

interface CityResponse {
  country: string;
  lat: number;
  local_names: Record<string, string>;
  lon: number;
  name: string;
  state: string;
}

interface LatLong {
  lat: number;
  long: number;
}

const cityCache: Record<string, LatLong> = {};

export const getLatLongFromCity = async (city: string): Promise<LatLong> => {
  city = city.toLocaleLowerCase();

  if (cityCache[city]) {
    return cityCache[city];
  }

  const result = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`
  );

  const res: CityResponse[] = await result.json();

  if (res.length === 0) {
    throw new Error("No results found");
  }

  const latLong: LatLong = {
    lat: res[0].lat,
    long: res[0].lon,
  };

  cityCache[city] = latLong;

  return latLong;
};
