<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import {
  map as createMap,
  tileLayer,
  circle,
  polygon,
  LayerGroup,
  layerGroup,
  Map,
} from "leaflet";
import { getLatLongFromCity } from "@/api";

const initialLat: number = 51.508;
const initialLong: number = -0.11;

const city = ref("");

const redCircle = circle([initialLat, initialLong], {
  color: "red",
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500,
}).bindPopup("Hello, I'm a circle");

const blueTriangle = polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047],
]);

const baseLayerGroup: LayerGroup = layerGroup([redCircle, blueTriangle]);
const newLayerGroup = layerGroup();

let map: Map | null = null;

const latitude = ref(initialLat);
const longitude = ref(initialLong);

// note: newLayerGroup can't be wrapped in reactive because the proxy messes
// with the popup map's internal properties
const isNewLayerEmpty = ref(true);

onMounted(() => {
  map = createMap("map");

  map.setView([initialLat, initialLong], 12);

  tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  map.addLayer(baseLayerGroup);
  map.addLayer(newLayerGroup);

  map.on("click", (e) => {
    const shape = circle(e.latlng, {
      color: "blue",
      radius: 250,
    }).bindPopup(`Lat: ${e.latlng.lat}. <br/>Long: ${e.latlng.lng}`);

    newLayerGroup.addLayer(shape);
    isNewLayerEmpty.value = false;
  });
});

const clearNewLayer = () => {
  newLayerGroup.clearLayers();
  isNewLayerEmpty.value = true;
};

watch([latitude, longitude], () => {
  map?.setView({
    lat: latitude.value,
    lng: longitude.value,
  });
});

const resetLatLong = () => {
  latitude.value = initialLat;
  longitude.value = initialLong;
  city.value = "";
};

const goToCity = async () => {
  if (city.value.length === 0) {
    return;
  }

  const { lat, long } = await getLatLongFromCity(city.value);

  latitude.value = lat;
  longitude.value = long;
};
</script>

<template>
  <div class="container">
    <div id="map" />
    <div class="controls">
      <div class="row">
        <button @click="clearNewLayer" :disabled="isNewLayerEmpty">
          Clear
        </button>
      </div>
      <div class="row">
        <label for="city">City</label>
        <input
          v-model="city"
          type="text"
          name="city"
          id="city"
          @keydown.enter="goToCity"
        />
        <button style="margin-left: 1rem" @click="goToCity">Go to city</button>
      </div>
      <div class="row">
        <label for="lat">Lat</label>
        <input
          v-model="latitude"
          type="number"
          name="Lat"
          id="lat"
          step="0.1"
        />

        <label for="long">Long</label>
        <input
          v-model="longitude"
          type="number"
          name="Long"
          id="long"
          step="0.1"
        />

        <button style="margin-left: 1rem" @click="resetLatLong">
          Reset Lat/Long
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#map {
  width: 100%;
  height: 500px;
  border-radius: 20px;
  border: 1px solid black;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
    rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}

#map:hover {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
    rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  transition: box-shadow 0.3s;
  transition-timing-function: ease;
}

.container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid black;
  border-radius: 20px;
}

.controls {
  display: flex;
  margin: 2rem 0;
  flex-direction: column;
}

.row {
  display: flex;
  padding: 10px 0;
}

label {
  padding: 0 1rem;
}

::v-deep .leaflet-control-attribution {
  padding-right: 10px;
}
</style>
