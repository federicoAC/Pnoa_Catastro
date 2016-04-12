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


//  EPSG:3857 a EPSG:4326.
var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');


// The "start" and "destination" features.
var startPoint = new ol.Feature();
var destPoint = new ol.Feature();


// The vector layer used to display the "start" and "destination" features.
var vectorLayer = new ol.layer.Vector({
	name:'puntos2',
	description:'Mide la distancia entre dos puntos dados',
	source: new ol.source.Vector({
    features: [startPoint, destPoint]
  })
});
map.addLayer(vectorLayer);

/*	 
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
	alert("Capa base: " + base.get('name') + ', indice= 1 de ' + indice
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
		if(lay instanceof ol.layer.Image){
		//		console.debug(lay.get('source').getParams()['SRS']);
			alert("Capa: " + lay.get('name') + ', indice= ' + (i+1) + ' de ' + indice
				+"\n - Opacidad: \b" + lay.get('opacity') + '\b'
				+"\n - Visibilidad: " + lay.get('visible')
				+"\n - Z-Index: " + lay.get('z-index')
				+"\n - Resolucion Maxima: " + lay.get('maxResolution')
				+"\n - Resolucion Minima: " + lay.get('minResolution')
				+"\n - Fuente Url: " + (lay.get('source')).getUrl()
				+"\n - Capa: " + lay.get('source').getParams()['LAYERS']
				+"\n - SRS: " + lay.get('source').getParams()['SRS']
			);
		}else if(lay instanceof ol.layer.Vector){
			alert("Capa Vectorial: " + lay.get('name') + ', indice= ' + (i+1) + ' de ' + indice
					+'\ndescripcion: ' + lay.get('description')
			)
			
			}
		else{}
	};	
};

function TablaEnumerarCapas(){//presenta tabla resumen de capas.
	if(document.getElementById('tablaH').style.display == "none"){
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
					+"<td>SRS</td>"
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
				+"<td>"  + base.get('source').getLayer() + "</td>"
				+"<td>"  + base.get('source').getMatrixSet() + "</td>"
				+"</tr>"
			);
			tablaCapas += capa;
			
			
//	resto de capas:	
		for (i = 1; i < indice; i++) {
			var lay = capas.item(i);
			if(lay instanceof ol.layer.Image){
			capa="";		
			capa =(
				"<tr>"
				+"<td>" + lay.get('name') + "</td>"
				+"<td>" + lay.get('opacity') + "</td>"
				+"<td>" + lay.get('visible') + "</td>"
				+"<td>" + lay.get('z-index') + "</td>"
				+"<td>" + lay.get('maxResolution') + " - " + lay.get('minResolution')+ "</td>"
				+"<td>" + lay.get('source').getUrl() + "</td>"
				+"<td>" + lay.get('source').getParams()['LAYERS'] + "</td>"
				+"<td>" + lay.get('source').getParams()['SRS'] + "</td>"
				+"</tr>"		
			);
			}else if(lay instanceof ol.layer.Vector){
				capa="";		
				capa =(
					"<tr>"
					+"<td>" + lay.get('name') + "</td>"
					+"<td colspan='7' align='middle'>" +  lay.get('description') + "</td>"//
				/*	+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>"
					+"<td>" + '&nbsp;' + "</td>" */
					+"</tr>"
				)
			}
			tablaCapas += capa; 	
		};
		tablaCapas += "</table>";
		document.getElementById('tablaH').innerHTML = tablaCapas;
	}else{
		document.getElementById('tablaH').style.display = "none";
	}
};

var director="informacion";

function Informacion(){
	director = "informacion";
};

function Medir(){
	director="medir";
};

function Marcador(){
	director="marcador";
};

function Posicion(){
	director="posicion";
};

function ReferenciaCatastral(){
	director="referenciaCatastral";
}

var tree = false;
        function doGeoCodingCall(){
            var url = "http://nominatim.openstreetmap.org/search?q=gandia+valencia&polygon=1&format=json"
            $.get(url,
                function(data){
                    console.debug(data);

                    var poly = data[0].polygonpoints;
                    var local = [];
                    var proj2 = proj4.defs('EPSG:3857');
                    var proj1 = proj4.defs('EPSG:4326');
                    for (i = 0; i < poly.length; i++){
                        geom = poly[i];
                        local.push(proj4(proj1, proj2).forward([geom[0], geom[1]]));
                    }

                    var hull = new ol.geom.Polygon([local]);
                    var src = new ol.source.Vector();
                    var feature = new ol.Feature({
                        geometry: hull
                    });


                    src.addFeature(feature);
                    var layer = new ol.layer.Vector({
                        source: src
                    });


                    olMap.addLayer(layer, data[0].display_name);

                    if (!tree){
                        loadTree(olMap);
                        tree = true;
                    }
                }
            );
        }

        function done(){
            console.log ("DONE");
        }
/*
        function loadTree(mapa) {
            var tree = new layerTree({map: mapa.getOLMap(), target: 'layertree', messages: 'messageBar'})
            mapa.getOLMap().getLayers().forEach(function (lay) {
                var layer = lay;
                tree.createRegistry(layer);
            });
        }
*/

// GETFEATUREINFO

map.on('singleclick', function (evt) {
	
switch (director){
	case "medir":
	//	alert("medir");
		
		if (startPoint.getGeometry() == null) {
			startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
		  
		} else if (destPoint.getGeometry() == null) {
			destPoint.setGeometry(new ol.geom.Point(evt.coordinate));
			
			// Coordenadas (EPSG:3857) a (EPSG:4326).
			var startCoord = transform(startPoint.getGeometry().getCoordinates());
			var destCoord = transform(destPoint.getGeometry().getCoordinates());
			
			var viewparams = [
			  'x1:' + startCoord[0], 'y1:' + startCoord[1],
			  'x2:' + destCoord[0], 'y2:' + destCoord[1]
			];
			
			alert('De (' 
					+ viewparams[0] + ', ' + viewparams[1] + ') a ('
					+ viewparams[2] + ', ' + viewparams[3] 
				//	+ '--> Distancia = ' + distance 
					+ ')'
			);
			
			var line = new ol.Geometry.Curve([startPoint, destPoint]);//ojo con CURVE
			var distance = line.getGeodesicLength();
						
			alert('De (' 
					+ viewparams[0] + ', ' + viewparams[1] + ') a ('
					+ viewparams[2] + ', ' + viewparams[3] 
					+ '--> Distancia = ' + distance + ')'
			);
		  };		
		break;
		
	case "posicion":
		startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
		var startCoord = transform(startPoint.getGeometry().getCoordinates());		
		var lon = startCoord[0];
		var lat = startCoord[1];
		alert("Posición en Grados: (" + lon + ", " + lat + ")"
			+'\nPosicion en Metros:  (' + startPoint.getGeometry().getCoordinates()[0] + ", "  
								+ startPoint.getGeometry().getCoordinates()[1] + ")"
		);
		break;
	
	case "referenciaCatastral":
		startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
		var startCoord = transform(startPoint.getGeometry().getCoordinates());		
		var lon = startCoord[0];
		var lat = startCoord[1];

		//Consulta catastro
		var urlserv = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/";
            //var consulta = "Consulta_RCCOOR_Distancia";
            var consulta = "Consulta_RCCOOR";
            var epsg = "3857";

            var proxy = 'http://voxel3d.tk/api/scripts/xml2json.php';
            var url = proxy + '?url='
            /*url = url + "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR_Distancia%3FSRS%3DEPSG%253A3857";*/
           /* url = url + "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR%3FSRS%3DEPSG%253A3857";*/

            url = url + urlserv + consulta;
            url = url + "%3FSRS%3D";
            url = url + "EPSG" + "%253A" + epsg;
            url = url + "%26Coordenada_X%3D" + startPoint.getGeometry().getCoordinates()[0];
            url = url + "%26Coordenada_Y%3D" + startPoint.getGeometry().getCoordinates()[1];


            var refcat = null;

            // Croos Domain Proxy in VOXEL WME API
            // Not necesary reimplement the proxy in local server
			 $.ajax({
                url: url,
                type: 'GET',
                crossDomain:true,
                dataType: "jsonp",
                success: function() {
                    console.debug("All")
                }
            }).done(
                function(data){
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(data['contents'],"text/xml");

                    console.debug( xmlDoc);
                    var ldt = xmlDoc.getElementsByTagName("ldt");
				//	var debi = xmlDoc.getElementsByTagName("debi");
					
					console.debug(ldt);
				//	console.debug(debi);
					
					alert('Posicion en Grados: ('
						+ lon + ', ' + lat + ')'
						+ '\nDescripcion: ' + ldt[0].textContent
				//		+ '\nSuperficie: ' + debi[0].textContent
					);
					
					var array =[];
                    for (i =0; i < ldt.length; i++){
						var descrip = ldt[i].textContent;
						console.debug(descrip);
						array.push(descrip);
                    }
				
                    var pc1 = xmlDoc.getElementsByTagName("pc1");
                    var pc2 = xmlDoc.getElementsByTagName("pc2");
                    var array1 = [];
                    for (i =0; i < pc1.length; i++){
                        var refcat = pc1[i].textContent + pc2[i].textContent
                        console.debug(refcat);
                        array1.push(refcat);
                    }					
					doGeoCodingCall();
					var ldts = "";
					for (i =0; i < ldt.length; i++){
							+ '\nDescripcion: ' + ldt[i].textContent
						}
					
				
				alert('Posicion en Grados: ('
						+ lon + ', ' + lat + ')'
						+ '\nPosicion en Metros:  ('									
							+ startPoint.getGeometry().getCoordinates()[0] + ', '  
							+ startPoint.getGeometry().getCoordinates()[1] + ')'
						+ '\nReferencia catastral: ' + refcat +
						
						+ ldts
						
					);
				}	
				)
				
		break;
		
	case "marcador":
		startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
		var startCoord = transform(startPoint.getGeometry().getCoordinates());		
		var lon = startCoord[0];
		var lat = startCoord[1];
		alert("Marcador en: (" + lon + ", " + lat + ")");
	//ojo unidades grados o metros.
		var featurePoint = new ol.Feature.Vector(
			(startPoint),
			{some:'data'},
			{externalGraphic:'./imagenes/citysquare.png',graphicHeigth:21,graphicWidth:16}
			);		
		vectorlayers.addFeatures(featurePoint);
		map.addLayer(vectorLayer);	
		break;
		
	case "informacion":
	
	default:		
	//	document.getElementById('info').innerHTML = '';
		var view = map.getView();
		var viewResolution = view.getResolution();
		var wmsSource = catastro.getSource();
		var url = wmsSource.getGetFeatureInfoUrl(evt.coordinate, viewResolution,
				'EPSG:3857', 
				{'INFO_FORMAT' : 'text/html'}
				);
		if (url) {
	//	document.getElementById('info').innerHTML = ""+url;
			alert(""+url);
		}else{
			alert("Sin Datos");
		}
		break;
}
});
