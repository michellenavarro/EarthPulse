// ================================
// 🌍 EarthPulse - Stable Cesium MVP
// ================================

// IMPORTANT: no Ion token needed for this MVP
Cesium.Ion.defaultAccessToken = undefined;

// -------------------------------
// Viewer setup (stable config)
// -------------------------------
const viewer = new Cesium.Viewer("cesiumContainer", {
  imageryProvider: new Cesium.IonImageryProvider({ assetId: 2 }),
  baseLayerPicker: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  animation: false,
  timeline: false,
  fullscreenButton: false,
  geocoder: false,
});

// Camera starting position
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(0, 20, 20000000),
});

// Atmosphere (nice visual touch)
viewer.scene.skyAtmosphere.show = true;

// UI panel
const infoPanel = document.getElementById("infoPanel");

// -------------------------------
// Color function (optional placeholder)
// -------------------------------
function getColor(value) {
  if (value < 2000) return Cesium.Color.GREEN.withAlpha(0.4);
  if (value < 8000) return Cesium.Color.ORANGE.withAlpha(0.4);
  return Cesium.Color.RED.withAlpha(0.5);
}

// -------------------------------
// Country GeoJSON source
// -------------------------------
const url =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

// -------------------------------
// Load countries safely
// -------------------------------
Cesium.GeoJsonDataSource.load(url, {
  clampToGround: false, // important: avoids terrain/geometry edge issues
})
  .then((dataSource) => {
    viewer.dataSources.add(dataSource);

    const entities = dataSource.entities.values;

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];

      if (!entity.polygon) continue;

      // ================================
      // SAFE STYLING (NO OUTLINES)
      // ================================
      entity.polygon.material = Cesium.Color.DARKSLATEGRAY.withAlpha(0.35);

      entity.polygon.outline = false;

      // ensure correct classification behavior (optional but stable)
      entity.polygon.classificationType =
        Cesium.ClassificationType.TERRAIN;
    }

    // zoom to world
    viewer.zoomTo(dataSource);
  })
  .catch((err) => {
    console.error("GeoJSON load failed:", err);
  });

// -------------------------------
// Click interaction (safe picking)
// -------------------------------
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.position);

  if (Cesium.defined(picked) && picked.id && picked.id.properties) {
    const props = picked.id.properties;

    const name =
      props.NAME_EN?.getValue?.() ||
      props.name?.getValue?.() ||
      "Unknown Country";

    infoPanel.innerHTML = `
      <b>${name}</b><br/>
      CO₂: (not yet connected)<br/>
      Status: geometry loaded ✔
    `;
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);