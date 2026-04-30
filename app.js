Cesium.Ion.defaultAccessToken = undefined;

const viewer = new Cesium.Viewer("cesiumContainer", {
  imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
  baseLayerPicker: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  animation: false,
  timeline: false,
  fullscreenButton: false,
  geocoder: false,
});

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
});

viewer.scene.skyAtmosphere.show = true;

const infoPanel = document.getElementById("infoPanel");


let co2ByISO = {};
let nameToISO = {};
let normalizedNameToISO = {};

function normalize(name) {
  return (name || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// load data
async function loadCO2() {
  co2ByISO = await fetch("./data/co2.json").then(r => r.json());
}

async function loadCountries() {
  nameToISO = await fetch("./data/country-name-to-iso.json").then(r => r.json());

  // build normalized lookup table
  for (const [name, iso] of Object.entries(nameToISO)) {
    normalizedNameToISO[normalize(name)] = iso;
  }
}

// color scale 
function getColor(co2Obj) {
  const co2 = co2Obj?.co2;

  if (co2 == null) return Cesium.Color.GRAY.withAlpha(0.25);

  const v = Math.log10(co2 + 1);

  if (v < 1.2) return Cesium.Color.GREEN.withAlpha(0.35);
  if (v < 2.2) return Cesium.Color.YELLOW.withAlpha(0.4);
  if (v < 3.0) return Cesium.Color.ORANGE.withAlpha(0.45);
  return Cesium.Color.RED.withAlpha(0.55);
}

// geojson
const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

function getCountryName(entity) {
  const p = entity.properties;

  return (
    p?.ADMIN?.getValue?.() ||
    p?.NAME?.getValue?.() ||
    p?.name?.getValue?.() ||
    null
  );
}

function resolveISO(name) {
  if (!name) return null;

  // try exact match first
  if (nameToISO[name]) return nameToISO[name];

  // fallback normalized match 
  const norm = normalize(name);
  return normalizedNameToISO[norm] || null;
}


async function loadWorld() {
  await loadCO2();
  await loadCountries();

  const dataSource = await Cesium.GeoJsonDataSource.load(GEOJSON_URL);

  viewer.dataSources.add(dataSource);

  const entities = dataSource.entities.values;

  let matched = 0;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];

    if (!entity.polygon) continue;

    const name = getCountryName(entity);
    const iso = resolveISO(name);
    const co2 = iso ? co2ByISO[iso] : null;

    if (co2?.co2 != null) matched++;

    entity.polygon.material = getColor(co2);
    entity.polygon.outline = false;
  }

  viewer.zoomTo(dataSource);
}

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.position);

  if (!Cesium.defined(picked) || !picked.id?.properties) return;

  const name = getCountryName(picked.id);
  const iso = resolveISO(name);
  const co2 = iso ? co2ByISO[iso] : null;

  infoPanel.innerHTML = `
    <b>${name || "Unknown"}</b><br/>
    ISO: ${iso || "N/A"}<br/>
    CO₂: ${co2 ? co2.co2.toFixed(2) + " Mt" : "No data"}
  `;
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

loadWorld().catch(console.error);