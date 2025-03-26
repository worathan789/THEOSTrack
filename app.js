const viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: true,
    animation: true,
    shouldAnimate: true,
    baseLayerPicker: true
});

const tleData = {
    "THEOS-1": [
        "1 33396U 08049A   25083.87213906  .00000283  00000+0  15311-3 0  9995",
        "2 33396  98.6176 149.1908 0001332  96.9286 263.2042 14.20082670854190"
    ],
    "THEOS-2": [
        "1 58016U 23155A   25083.88629186  .00003640  00000+0  46978-3 0  9991",
        "2 58016  97.9047 156.2251 0001223  90.4571 269.6781 14.81595690 78893"
    ]
};

function getCurrentCycleTLE(tle, selectedDate, cycleDays = 26) {
    const epochDate = Cesium.JulianDate.toDate(Cesium.JulianDate.fromDate(new Date("2025-03-18")));
    const daysDiff = Math.floor((selectedDate - epochDate) / (1000 * 60 * 60 * 24));
    const cyclesPassed = Math.floor(daysDiff / cycleDays);
    const currentEpoch = new Date(epochDate.getTime() + cyclesPassed * cycleDays * 24 * 60 * 60 * 1000);
    return tle; // Simulate repeat cycle; real implementation adjusts elements
}

function plotSatellite(name, tleLines, color) {
    const satrec = satellite.twoline2satrec(tleLines[0], tleLines[1]);
    const positions = [];

    const start = Cesium.JulianDate.fromDate(new Date());
    for (let i = 0; i <= 90; i++) {
        const time = Cesium.JulianDate.addMinutes(start, i * 10, new Cesium.JulianDate());
        const jsDate = Cesium.JulianDate.toDate(time);
        const positionAndVelocity = satellite.propagate(satrec, jsDate);
        const positionEci = positionAndVelocity.position;
        const gmst = satellite.gstime(jsDate);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const longitude = Cesium.Math.toDegrees(positionGd.longitude);
        const latitude = Cesium.Math.toDegrees(positionGd.latitude);
        const height = positionGd.height * 1000;

        const pos = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        positions.push(pos);
    }

    viewer.entities.add({
        name: name,
        polyline: {
            positions: positions,
            width: 2,
            material: color
        }
    });

    viewer.entities.add({
        name: name,
        position: positions[positions.length - 1],
        point: { pixelSize: 6, color: color },
        label: {
            text: name,
            font: '14pt sans-serif',
            fillColor: color,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12)
        }
    });
}

document.getElementById("datePicker").valueAsDate = new Date();

function updateOrbits() {
    viewer.entities.removeAll();
    const showTheos1 = document.getElementById("theos1").checked;
    const showTheos2 = document.getElementById("theos2").checked;
    const selectedDate = new Date(document.getElementById("datePicker").value);

    if (showTheos1) {
        plotSatellite("THEOS-1", getCurrentCycleTLE(tleData["THEOS-1"], selectedDate), Cesium.Color.CORNFLOWERBLUE);
    }
    if (showTheos2) {
        plotSatellite("THEOS-2", getCurrentCycleTLE(tleData["THEOS-2"], selectedDate), Cesium.Color.CYAN);
    }
}

document.getElementById("theos1").addEventListener("change", updateOrbits);
document.getElementById("theos2").addEventListener("change", updateOrbits);
document.getElementById("datePicker").addEventListener("change", updateOrbits);

updateOrbits();
