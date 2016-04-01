/**
 * 
 */
/*pnoa*/
var projection_pnoa = ol.proj.get('EPSG:3857');
var projectionExtent_pnoa = projection_pnoa.getExtent();
var size_pnoa = ol.extent.getWidth(projectionExtent_pnoa) / 256;
var resolutions = new Array(21);
var matrixIds = new Array(21);
var zoom;
var z;
for (z = 0; z < 21; ++z) {
	// generate resolutions and matrixIds arrays for this WMTS
	resolutions[z] = size_pnoa / Math.pow(2, z);
	matrixIds[z] = z;
}

var pnoa = new ol.layer.Tile({
	name: 'pnoa',
	source : new ol.source.WMTS({
		url : 'http://www.ign.es/wmts/pnoa-ma',
		layer : 'OI.OrthoimageCoverage',
		matrixSet : 'EPSG:3857',
		format : 'image/jpeg',
		projection : projection_pnoa,
		tileGrid : new ol.tilegrid.WMTS({
			origin : ol.extent.getTopLeft(projectionExtent_pnoa),
			resolutions : resolutions,
			matrixIds : matrixIds
		}),
		style : 'default'
	})
});

/*catastroParc*/
var catastroParc = new ol.layer.Image({
	name:'rustica',
	source : new ol.source.ImageWMS({
		url : 'http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
		params : {
			'LAYERS' : 'SUBPARCE',
			'SRS' : 'EPSG:3857'
		},
		serverType : 'geoserver'
	})
});

/*catastro*/
var catastro = new ol.layer.Image({
	name: 'catastro',
	source : new ol.source.ImageWMS({
		url : 'http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
		params : {
			'LAYERS' : 'Catastro',
			'SRS' : 'EPSG:3857'
		},
		serverType : 'geoserver'
	})
});

/*posicion del raton en EPSG3857*/
var raton3857 = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(2),
	projection: 'EPSG:3857',
	target: document.getElementById('posicionRaton'),
	undefinedHTML: '&nbsp;'
	});
	
/*posicion del raton en EPSG4326*/
var raton4326 = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(6),
	projection: 'EPSG:4326',
	target: document.getElementById('info'),
	undefinedHTML: '&nbsp;'
	});
	
var zoomIni = 15;
	
/*mapa*/
var map = new ol.Map({
	target : 'map',
	layers : [],
/*quitamos los controles por defecto*/
	controls: ol.control.defaults({
		zoom: false,
		attribution: false,
		rotate: false,
//		new OpenLayers.Control.LayerSwitcher({'ascending':false}),¡¡¡PRIVADO!!!.
	}).extend( [raton4326] ),
	view : new ol.View({
		projection : new ol.proj.Projection({
//			code : 'EPSG:4326',
			code : 'EPSG:3857',
			units : 'm'
		}),
        center : ol.proj.transform([ -4.719617664813995, 41.58075384978768 ],
				'EPSG:4326', 'EPSG:3857'),
        zoom : zoomIni,
				
	}),
	
});

map.addLayer(pnoa);/* la base pnoa */
map.addLayer(catastro);
map.addLayer(catastroParc);

function CatastralOnOff(){	
if(catastro.get('visible')){
	catastro.setProperties({visible: false});
}else{
	catastro.setProperties({visible: true});
}
};

function zoomMas(){
	var view = map.getView();
	view.setZoom(view.getZoom()+1);
};

function zoomMenos(){	
	var view = map.getView();
	view.setZoom(view.getZoom()-1);
};

function zoomInicial(){	
	var view = map.getView();
	view.setZoom(zoomIni);
};

function DarPosicionClick(){
	map.addControl(new OpenLayers.Control.MousePosition({numDigits:2}));
};

function LeerCapas(){
	var capas = map.getLayers();
	var lay = capas.item(i);
		alert("lay =" + capas.item(i) + ", Capa: " + lay.get('name'));
		alert("Fuente Url: " + (lay.getSource()).getUrl());
};

function EnumerarCapas(){
	var capas = map.getLayers();
	var indice = capas.getLength();
	
//	for (i = 0; i < indice; i++) {
	for (i = 1; i < indice; i++) {//0 es el WMTS
		var lay = capas.item(i);
				
		alert("Capa: " + lay.get('name')
			+"\n - Opacidad: " + lay.get('opacity')
			+"\n - Visibilidad: " + lay.get('visible')
			+"\n - Z-Index: " + lay.get('z-index')
			+"\n - Resolucion Maxima: " + lay.get('maxResolution')
			+"\n - Resolucion Minima: " + lay.get('minResolution')
/*discrimina si es WMS ó WMTS, si WMTS falla*/
			+"\n - Fuente Url: " + (lay.get('source')).getUrl()
			
//			+"\n - Fuente Url: " + (catastro.get('source')).getUrl()
//			+"\n - Fuente Url: " + (catastro.getSource()).getUrl()
		);
	};	
};

// GETFEATUREINFO

map.on('singleclick', function (evt) {
//	document.getElementById('info').innerHTML = '';
	var view = map.getView();
	var viewResolution = view.getResolution();
	var wmsSource = catastro.getSource();
	var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution,
			'EPSG:3857', {
				'INFO_FORMAT' : 'text/html'
			});
	if (url) {
//		document.getElementById('info').innerHTML = ""+url;
		alert(""+url);
	}
});