
const viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: true,
    animation: true
});

function loadSatellites() {
    const tle1 = [
        "THEOS-1",
        "1 99999U 23001A   24084.00000000  .00000000  00000-0  00000-0 0 0000",
        "2 99999 098.7820 000.0000 0001000 000.0000 000.0000 14.80000000    01"
    ];
    const tle2 = [
        "THEOS-2",
        "1 99998U 23002A   24084.00000000  .00000000  00000-0  00000-0 0 0000",
        "2 99998 098.7820 000.0000 0001000 000.0000 000.0000 14.80000000    02"
    ];

    function addSatellite(tle, color) {
        const satrec = satellite.twoline2satrec(tle[1], tle[2]);
        const totalMinutes = 1440;
        const positionsOverTime = new Cesium.SampledPositionProperty();
        const start = Cesium.JulianDate.now();
        for (let i = 0; i < totalMinutes; i += 10) {
            const time = Cesium.JulianDate.addMinutes(start, i, new Cesium.JulianDate());
            const date = Cesium.JulianDate.toDate(time);
            const pos = satellite.propagate(satrec, date);
            if (pos.position) {
                const gmst = satellite.gstime(date);
                const p = satellite.eciToGeodetic(pos.position, gmst);
                const carto = Cesium.Cartographic.fromDegrees(Cesium.Math.toDegrees(p.longitude), Cesium.Math.toDegrees(p.latitude), p.height * 1000);
                const pos3d = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height);
                positionsOverTime.addSample(time, pos3d);
            }
        }
        viewer.entities.add({
            name: tle[0],
            position: positionsOverTime,
            point: { pixelSize: 6, color: color },
            label: {
                text: tle[0],
                font: '14pt sans-serif',
                fillColor: color,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -9)
            },
            path: {
                resolution: 600,
                material: color,
                width: 2
            }
        });
    }

    addSatellite(tle1, Cesium.Color.BLUE);
    addSatellite(tle2, Cesium.Color.CYAN);
}

loadSatellites();
