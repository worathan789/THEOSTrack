const viewer = new Cesium.Viewer('cesiumContainer', {
    shouldAnimate: true,
    timeline: true,
    animation: true
});

// TLE ต้นฉบับ (THEOS-1)
const tle1 = [
    "1 99999U 23001A   25084.00000000  .00000000  00000-0  00000-0 0 00001",
    "2 99999 098.7000 000.0000 0001000 000.0000 000.0000 14.20000000    01"
];

const tle2 = [
    "1 88888U 23002A   25084.00000000  .00000000  00000-0  00000-0 0 00002",
    "2 88888 098.7000 005.0000 0001000 000.0000 000.0000 14.25000000    02"
];

function propagateTLE(tle, color, name) {
    const satrec = satellite.twoline2satrec(tle[0], tle[1]);
    const positions = [];
    const start = Cesium.JulianDate.fromDate(new Date());
    for (let i = 0; i < 90; i++) {
        const time = Cesium.JulianDate.addMinutes(start, i * 5, new Cesium.JulianDate());
        const date = Cesium.JulianDate.toDate(time);
        const positionAndVelocity = satellite.propagate(satrec, date);
        const positionEci = positionAndVelocity.position;
        if (!positionEci) continue;
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const longitude = Cesium.Math.toDegrees(positionGd.longitude);
        const latitude = Cesium.Math.toDegrees(positionGd.latitude);
        const height = positionGd.height * 1000;
        const cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        positions.push(cartesian);
    }

    viewer.entities.add({
        name: name,
        polyline: {
            positions: positions,
            width: 2,
            material: color
        },
        description: "Orbit of " + name
    });
}

document.getElementById("theos1").addEventListener("change", (e) => {
    viewer.entities.removeAll();
    if (e.target.checked) propagateTLE(tle1, Cesium.Color.SKYBLUE, "THEOS-1");
    if (document.getElementById("theos2").checked) propagateTLE(tle2, Cesium.Color.CYAN, "THEOS-2");
});

document.getElementById("theos2").addEventListener("change", (e) => {
    viewer.entities.removeAll();
    if (document.getElementById("theos1").checked) propagateTLE(tle1, Cesium.Color.SKYBLUE, "THEOS-1");
    if (e.target.checked) propagateTLE(tle2, Cesium.Color.CYAN, "THEOS-2");
});

// load default
propagateTLE(tle1, Cesium.Color.SKYBLUE, "THEOS-1");
propagateTLE(tle2, Cesium.Color.CYAN, "THEOS-2");