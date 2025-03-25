
Cesium.Ion.defaultAccessToken = "1b7a70db0c8e4df4a6b4b6ef9ff1e9d1";

const viewer = new Cesium.Viewer("cesiumContainer", {
  shouldAnimate: true,
  timeline: false,
});

const baseTLEs = {
  "THEOS": [
    "1 33396U 08049A   25083.87213906  .00000283  00000+0  15311-3 0  9995",
    "2 33396  98.6176 149.1908 0001332  96.9286 263.2042 14.20082670854190"
  ],
  "THEOS-2": [
    "1 58016U 23155A   25083.88629186  .00003640  00000+0  46978-3 0  9991",
    "2 58016  97.9047 156.2251 0001223  90.4571 269.6781 14.81595690 78893"
  ]
};

function propagateSatellite(name, tle, date) {
  const satrec = satellite.twoline2satrec(tle[0], tle[1]);
  let positions = [];
  for (let i = 0; i < 1440; i += 5) {
    let time = new Date(date.getTime() + i * 60000);
    let posVel = satellite.propagate(satrec, time);
    if (!posVel.position) continue;
    let gmst = satellite.gstime(time);
    let geo = satellite.eciToGeodetic(posVel.position, gmst);
    let lat = Cesium.Math.toDegrees(geo.latitude);
    let lon = Cesium.Math.toDegrees(geo.longitude);
    let height = geo.height * 1000;
    positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, height));
  }
  return positions;
}

function showSatellites(date) {
  viewer.entities.removeAll();
  for (const [name, tle] of Object.entries(baseTLEs)) {
    const track = propagateSatellite(name, tle, date);
    viewer.entities.add({
      name,
      polyline: {
        positions: track,
        width: 2,
        material: Cesium.Color.YELLOW
      }
    });
  }
}

document.getElementById("datePicker").addEventListener("change", function () {
  const selected = new Date(this.value);
  showSatellites(selected);
});

// Default: today
document.getElementById("datePicker").valueAsDate = new Date();
showSatellites(new Date());
