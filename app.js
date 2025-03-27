const viewer = new Cesium.Viewer('cesiumContainer', {
    shouldAnimate: true
});

const tleData = {
    'THEOS-1': [
        "1 33396U 08049A   25085.91542712  .00000292  00000+0  15710-3 0  9995",
        "2 33396  98.6172 151.1814 0001333  96.0190 264.1138 14.20084048854480"
    ],
    'THEOS-2': [
        "1 58016U 23155A   25085.91236103  .00003409  00000+0  44026-3 0  9995",
        "2 58016  97.9045 158.2246 0001208  91.0597 269.0754 14.81609957 79195"
    ]
};

function propagateAndDraw(tle, name, color) {
    const satrec = satellite.twoline2satrec(tle[0], tle[1]);
    const positions = [];
    const startTime = Cesium.JulianDate.fromDate(new Date());
    for (let i = 0; i < 96; i++) {
        const time = new Date(Date.now() + i * 10 * 60 * 1000);
        const gmst = satellite.gstime(time);
        const positionEci = satellite.propagate(satrec, time).position;
        if (!positionEci) continue;
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        const longitude = Cesium.Math.toDegrees(positionGd.longitude);
        const latitude = Cesium.Math.toDegrees(positionGd.latitude);
        const height = positionGd.height * 1000;
        const julianDate = Cesium.JulianDate.addMinutes(startTime, i * 10, new Cesium.JulianDate());
        positions.push({ time: julianDate, position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height) });
    }
    const property = new Cesium.SampledPositionProperty();
    positions.forEach(p => property.addSample(p.time, p.position));
    viewer.entities.add({
        name,
        position: property,
        point: { pixelSize: 10, color },
        label: {
            text: name,
            font: "14pt sans-serif",
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            fillColor: color,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -20)
        },
        path: {
            resolution: 120,
            material: color,
            width: 2,
            leadTime: 0,
            trailTime: 600
        }
    });
}

function plotSatellites() {
    viewer.entities.removeAll();
    if (document.getElementById('theos1').checked)
        propagateAndDraw(tleData["THEOS-1"], "THEOS-1", Cesium.Color.CORNFLOWERBLUE);
    if (document.getElementById('theos2').checked)
        propagateAndDraw(tleData["THEOS-2"], "THEOS-2", Cesium.Color.LIGHTSKYBLUE);
}

document.getElementById("datePicker").valueAsDate = new Date();
document.getElementById("datePicker").addEventListener("change", plotSatellites);
document.getElementById("theos1").addEventListener("change", plotSatellites);
document.getElementById("theos2").addEventListener("change", plotSatellites);

plotSatellites();