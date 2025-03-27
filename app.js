
// ตั้งค่า TLE เริ่มต้นของ THEOS-1 และ THEOS-2
const tleData = {
    "THEOS-1": [
        "1 33396U 08049A   25085.91542712  .00000292  00000+0  15710-3 0  9995",
        "2 33396  98.6172 151.1814 0001333  96.0190 264.1138 14.20084048854480"
    ],
    "THEOS-2": [
        "1 58016U 23155A   25085.91236103  .00003409  00000+0  44026-3 0  9995",
        "2 58016  97.9045 158.2246 0001208  91.0597 269.0754 14.81609957 79195"
    ]
};

const viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: true,
    animation: true
});

function addSatellite(name, tle, date, color) {
    const satrec = satellite.twoline2satrec(tle[0], tle[1]);
    const positions = [];
    const start = Cesium.JulianDate.fromDate(date);
    for (let i = 0; i <= 1440; i += 10) {
        const time = new Date(date.getTime() + i * 60000);
        const gmst = satellite.gstime(time);
        const positionAndVelocity = satellite.propagate(satrec, time);
        if (positionAndVelocity.position) {
            const positionEci = positionAndVelocity.position;
            const positionGd = satellite.eciToGeodetic(positionEci, gmst);
            const longitude = Cesium.Math.toDegrees(positionGd.longitude);
            const latitude = Cesium.Math.toDegrees(positionGd.latitude);
            const height = positionGd.height * 1000;
            const cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
            positions.push(cartesian);
        }
    }
    viewer.entities.add({
        name: name,
        polyline: {
            positions: positions,
            width: 2,
            material: color
        },
        label: {
            text: name,
            font: "14pt sans-serif",
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -10)
        },
        position: positions[positions.length - 1]
    });
}

function loadSatellites() {
    viewer.entities.removeAll();
    const dateStr = document.getElementById("datePicker").value;
    const selectedDate = new Date(dateStr);
    if (document.getElementById("theos1").checked) {
        addSatellite("THEOS-1", tleData["THEOS-1"], selectedDate, Cesium.Color.SKYBLUE);
    }
    if (document.getElementById("theos2").checked) {
        addSatellite("THEOS-2", tleData["THEOS-2"], selectedDate, Cesium.Color.CYAN);
    }
}

document.getElementById("datePicker").valueAsDate = new Date();
document.getElementById("datePicker").addEventListener("change", loadSatellites);
document.getElementById("theos1").addEventListener("change", loadSatellites);
document.getElementById("theos2").addEventListener("change", loadSatellites);

viewer.clock.startTime = Cesium.JulianDate.fromDate(new Date());
viewer.clock.currentTime = viewer.clock.startTime;
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 60;
viewer.timeline.zoomTo(viewer.clock.startTime, Cesium.JulianDate.addHours(viewer.clock.startTime, 24, new Cesium.JulianDate()));

loadSatellites();
