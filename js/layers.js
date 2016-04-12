//  OpenStreetMaps
var osmLayer = new ol.layer.Tile({
    layer_name: 'OpenStreetMaps',
    source: new ol.source.OSM(),
    opacity: 0.3,
    brightness: 0.2,
});

// Catastro
var catastro= new ol.layer.Image({
    layer_name: 'Catastro',
    source: new ol.source.ImageWMS({
        url: 'http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
        params: {'LAYERS': 'Catastro', 'SRS':'EPSG:3857'},
        serverType: 'geoserver'
    })
});

//  PNOA Ortofotos máxima actualidad
var projection_pnoa = ol.proj.get('EPSG:3857');
var projectionExtent_pnoa = projection_pnoa.getExtent();
var size_pnoa = ol.extent.getWidth(projectionExtent_pnoa) / 256;
var resolutions = new Array(21);
var matrixIds = new Array(21);
for (var z = 0; z < 21; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size_pnoa / Math.pow(2, z);
    matrixIds[z] = z;
}
  
var pnoa = new ol.layer.Tile({
    layer_name: 'PNOA',
    source: new ol.source.WMTS({
        url: 'http://www.ign.es/wmts/pnoa-ma',
        layer: 'OI.OrthoimageCoverage',
		matrixSet: 'EPSG:3857',
		format: 'image/jpeg',
		projection: projection_pnoa,
		tileGrid: new ol.tilegrid.WMTS({
			origin: ol.extent.getTopLeft(projectionExtent_pnoa),
			resolutions: resolutions,
			matrixIds: matrixIds
		}),
    style: 'default'
    })
});

//  Límites administrativos
//  Representación de líneas límite de comunidades autónomas, provincias y municipios de España
var limitesAdministrativos = new ol.layer.Image({
//        title: 'Límites administrativos',
    layer_name: 'Límites administrativos',
    opacity: 0.6,
    source: new ol.source.ImageWMS({
        url: 'http://www.ign.es/wms-inspire/unidades-administrativas?',
        params: {
            'LAYERS': 'AU.AdministrativeBoundary'
        },
        attributions: [
            new ol.Attribution({
                html: '© Instituto Geográfico Nacional de España'
            })
        ]
    })
});


//  Unidades administrativas
//  Representación de unidades administrativas de España. Se clasifican en 3 niveles. El segundo nivel corresponde a las comunidades autónomas; el tercer nivel, a las provincias; el cuarto nivel, a los municipios
var unidadAdministrativa = new ol.layer.Image({
//        title: 'Unidades administrativas',
    layer_name: 'Unidades administrativas',
    opacity: 0.6,
    source: new ol.source.ImageWMS({
        url: 'http://www.ign.es/wms-inspire/unidades-administrativas?',
        params: {
            'LAYERS': 'AU.AdministrativeUnit'
        },
        attributions: [
            new ol.Attribution({
                html: '© Instituto Geográfico Nacional de España'
            })
        ]
    })
});
