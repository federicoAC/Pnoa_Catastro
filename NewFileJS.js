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

/*rustica*/
var rustica = new ol.layer.Image({
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

/*Capa Vectorial para marcadores, medidas, ...*/
//var vectorLayer = new ol.Layer.Vector();

/*posicion del raton en EPSG3857*/
var raton3857 = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(2),
	projection: 'EPSG:3857',
	target: document.getElementById('posicionRaton'),
	undefinedHTML: '&nbsp;'
	});
	
/*posicion del raton en EPSG4326*/
var raton4326 = new ol.control.MousePosition({
	coordinateFormat: ol.coordinate.createStringXY(4),
	projection: 'EPSG:4326',
	target: document.getElementById('miPosicion'),
	undefinedHTML: 'Grados: lon, lat'
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

map.addLayer(pnoa);// base = pnoa 
map.addLayer(catastro);// capa1
map.addLayer(rustica);
map.addControl(new ol.control.ScaleLine({units:'meter'}));//control escala.
	
function CatastralOnOff(){	
if(catastro.get('visible')){
	catastro.setProperties({visible: false});
	rustica.setProperties({visible: false});
}else{
	catastro.setProperties({visible: true});
	rustica.setProperties({visible: true});
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

function DarPosicion(){
	var coord = event.feature.getGeometry().getCoordinates();
	coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
	var lon = coord[0];
	var lat = coord[1];
	alert(lon + ", " + lat);
};
	
function DarPosicionClick(){	
/*
	map.on('onmousedown',function(evt){
		var coord =  evt.coordinate({
		coordinateFormat: ol.coordinate.createStringXY(2),
		projection: 'EPSG:4326'
		});
	)
	var template = 'Coordinate is ({x}|{y}).';
	var out = ol.coordinate.format(coord, template, 2);
	alert(out);
	});
	map.events.register("click", map, function(e) {
                var lonlat = map.getLonLatFromViewPortPx(e.xy);
                alert(lonlat.lat + " - " +lonlat.lon);
	});
alert("DarPosicionClick");
*/
};
/*
// A transform function to convert coordinates from EPSG:3857
// to EPSG:4326.
var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');

// The "start" and "destination" features.
var startPoint = new ol.Feature();
var destPoint = new ol.Feature();

// The vector layer used to display the "start" and "destination" features.
var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    features: [startPoint, destPoint]
  })
});
map.addLayer(vectorLayer);

//function Medir(){
map.on('click', function(event) {// Register a map click listener.

  if (startPoint.getGeometry() == null) {// First click.
    startPoint.setGeometry(new ol.geom.Point(event.coordinate));
  } else if (destPoint.getGeometry() == null) {// Second click.
    destPoint.setGeometry(new ol.geom.Point(event.coordinate));
	
	var line = new ol.Geometry.Curve([startPoint, destPoint]);
	var distance = line.getGeodesicLength();
	
    // Transform the coordinates from the map projection (EPSG:3857)
    // to the server projection (EPSG:4326).
    var startCoord = transform(startPoint.getGeometry().getCoordinates());
    var destCoord = transform(destPoint.getGeometry().getCoordinates());
	
    var viewparams = [
      'x1:' + startCoord[0], 'y1:' + startCoord[1],
      'x2:' + destCoord[0], 'y2:' + destCoord[1]
    ];
	alert('(' + viewparams[0] + ', ' + viewparams[1] + ') a ('
			+ viewparams[2] + ', ' + viewparams[3] + ')'
	);
	 
    params.viewparams = viewparams.join(';');
    result = new ol.layer.Image({
      source: new ol.source.ImageWMS({
        url: 'http://localhost:8082/geoserver/pgrouting/wms',
        params: params
      })
    });
    map.addLayer(result);
  }
});
/*
	//ojo unidades grados o metros.
	var line = new ol.Geometry.Curve([startPoint, destPoint]);
	var distance = line.getGeodesicLength();
	var featureline = new ol.Feature.Vector(new ol.Geometry.Line(line),
		{some:'data'},
		{externalGraphic:'imagenes/marker.png',graphicHeigth:21,graphicWidth:16});		
	vectorlayers.addFeatures(featureline);
	map.addLayer(vectorLayer);	
	alert("Distancia desde " + startPoint + " a " + destPoint + " es de: " + distance);
*/
/*
};
*/
function EnumerarCapas(){//Presenta cuadros dialogo con cada capa.
	var capas = map.getLayers();
	var indice = capas.getLength();	
//	capa base
	var base = capas.item(0);
	
	alert("Capa base: " + base.get('name')
			+"\n - Opacidad: " + base.get('opacity')
			+"\n - Visibilidad: " + base.get('visible')
			+"\n - Z-Index: " + base.get('z-index')
			+"\n - Resolucion Maxima: " + base.get('maxResolution')
			+"\n - Resolucion Minima: " + base.get('minResolution')
			+"\n - Fuente Url: " + (base.get('source').getUrls())[0]
			+"\n - Capa: " + base.get('source').getLayer()
			+"\n - EPSG:: " + base.get('source').getMatrixSet()
			);
//	resto de capas:
	for (i = 1; i < indice; i++) {
		var lay = capas.item(i);
				console.debug(lay.get('source').getParams()['SRS']);
		alert("Capa: " + lay.get('name')
			+"\n - Opacidad: " + lay.get('opacity')
			+"\n - Visibilidad: " + lay.get('visible')
			+"\n - Z-Index: " + lay.get('z-index')
			+"\n - Resolucion Maxima: " + lay.get('maxResolution')
			+"\n - Resolucion Minima: " + lay.get('minResolution')
			+"\n - Fuente Url: " + (lay.get('source')).getUrl()
			+"\n - Capa: " + lay.get('source').getParams()['LAYERS']
			+"\n - SRS: " + lay.get('source').getParams()['SRS']
		);
	};	
};

function TablaEnumerarCapas(){//presenta tabla resumen de capas.
	if(document.getElementById('tablaH').style.display === "none"){
		document.getElementById('tablaH').style.display = "block";
	
		var capas = map.getLayers();
		var indice = capas.getLength();
		var capa = "";
		target: document.getElementById('tablaH');
		undefinedHTML: '&nbsp;';
		
		var tablaCapas = "<table border='1'><tr><td colspan='8' align='middle'>Capas</td></tr>"
					+"<tr><td>Nombre</td><td>Opacidad</td><td>Visibilidad</td>"
					+"<td>Z-index</td><td>Resolucion Max - Min</td>"
					+"<td>Fuente Url</td>"
					+"<td>Capa</td>"
					+"<td>EPSG</td>"
					+"</tr>"
	//	capa base
		var base = capas.item(0);
	//	var urls =( base.get('source').getUrls());//Coleccion de url
			capa =(
				"<tr>"
				+"<td>" + base.get('name') + "</td>"
				+"<td>" + base.get('opacity') + "</td>"
				+"<td>" + base.get('visible') + "</td>"
				+"<td>" + base.get('z-index') + "</td>"
				+"<td>" + base.get('maxResolution') + " - " + base.get('minResolution')+ "</td>"
				+"<td>" + (base.get('source').getUrls())[0] + "</td>"
				+"<td>"  + base.get('source').getLayer()+ "</td>"
				+"<td>"  + base.get('source').getMatrixSet()+ "</td>"
				+"</tr>"
			);
			tablaCapas += capa;
			
			
	//resto de capas:	
		for (i = 1; i < indice; i++) {
			var lay = capas.item(i);
			capa="";		
			capa =(
				"<tr>"
				+"<td>" + lay.get('name') + "</td>"
				+"<td>" + lay.get('opacity') + "</td>"
				+"<td>" + lay.get('visible') + "</td>"
				+"<td>" + lay.get('z-index') + "</td>"
				+"<td>" + lay.get('maxResolution') + " - " + lay.get('minResolution')+ "</td>"
				+"<td>" + (lay.get('source')).getUrl() + "</td>"
				+"<td>" + lay.get('source').getParams()['LAYERS']+ "</td>"
				+"<td>" + lay.get('source').getParams()['SRS']+ "</td>"
				+"</tr>"		
			);
			tablaCapas += capa; 	
		};
		tablaCapas += "</table>";
		document.getElementById('tablaH').innerHTML = tablaCapas;
	}else{
		document.getElementById('tablaH').style.display = "none";
	}
};



// GETFEATUREINFO
/*
map.on('singleclick', function (evt) {
	
	alert("Empezamos");	
*/
/*	var coord = evt.feature.getGeometry().getCoordinates();
	alert("Coordenadas: " + coord);
	coord = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
	var lon = coord[0];
	var lat = coord[1];
	alert("Posicion: " + lon + ", " +lat);
*/	
/*
//	document.getElementById('info').innerHTML = '';
	var view = map.getView();
	var viewResolution = view.getResolution();
	var wmsSource = catastro.getSource();
	var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution,
			'EPSG:3857', 
			{'INFO_FORMAT' : 'text/html'}
			);
			
	var indices= [];
	var n = 0;
	for(i=0;i<url.length;++i){
		n = url.indexOf("&", i);
		indices.add(n);
		i=n;
	}		
	alert(indices.item(0)
		+"\n " + indices.item(1)
		+"\n " + indices.item(2)
		+"\n " + indices.item(3)
		)
	if (url) {
//		document.getElementById('info').innerHTML = ""+url;
		alert(""+url);
	}else{
		alert("Sin Datos");
	}

});
*/