// Cesium Ion token not required for this simple setup
Cesium.Ion.defaultAccessToken = undefined;

const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
  animation: false,
  timeline: false,
  fullscreenButton: false,
  geocoder: false,
});

const infoPanel = document.getElementById("infoPanel");

// Color scale
function getColor(co2) {
  if (co2 < 2000) return Cesium.Color.GREEN.withAlpha(0.6);
  if (co2 < 8000) return Cesium.Color.ORANGE.withAlpha(0.6);
  return Cesium.Color.RED.withAlpha(0.6);
}

// Load GeoJSON
Cesium.GeoJsonDataSource.load("./data/co2_emissions.geojson", {
  clampToGround: true
}).then((dataSource) => {
  viewer.dataSources.add(dataSource);

  const entities = dataSource.entities.values;

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const co2 = entity.properties.co2_total.getValue();

    entity.polygon.material = getColor(co2);
    entity.polygon.outline = true;
    entity.polygon.outlineColor = Cesium.Color.BLACK;

    entity.polygon.extrudedHeight = co2 * 100; // visual emphasis

    entity.description = `
      <h3>${entity.properties.name.getValue()}</h3>
      <p><b>Total CO₂:</b> ${co2}</p>
      <p><b>Per Capita:</b> ${entity.properties.co2_per_capita.getValue()}</p>
    `;
  }

  viewer.zoomTo(dataSource);
});

// Click handler
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

handler.setInputAction((movement) => {
  const picked = viewer.scene.pick(movement.position);

  if (Cesium.defined(picked) && picked.id) {
    const props = picked.id.properties;

    infoPanel.innerHTML = `
      <b>${props.name.getValue()}</b><br/>
      CO₂: ${props.co2_total.getValue()}<br/>
      Per Capita: ${props.co2_per_capita.getValue()}
    `;
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);