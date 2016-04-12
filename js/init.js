function init(){

    // Función asociada al evento 'addedBaseLayers'
    function myFunction(){
        console.log ("ADD LAYERS FINISH");

        // Creamos el gestor de capas (layertree) en el div "layertree" y añadimos todas las capas del objeto "olMap"
        var olMap = newMap.getOLMap();
        var layertree = new layerTree({map: olMap, target: 'layertree', messages: 'messageBar'})
        for (var i=0; i<olMap.getLayers().getArray().length; i++) {
            layertree.createRegistry(olMap.getLayers().item(i));
        }


        olMap.getLayers().item(1).getSource().on('change', function (evt) {
            if (this.getState() === 'ready') {
                olMap.getLayers().item(1).buildHeaders();
            }
        });



        /*****************************************************************************/
        /* CATASTRO                                                                  */
        /*****************************************************************************/
        // Listener para consulta a catastro
        newMap.getOLMap().on('singleclick', function(evt){
            if (tree) return;
            console.debug(evt.coordinate);

            var refcat = localizacionCatastro(evt.coordinate);

        });

        function localizacionCatastro(coord){
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
            url = url + "%26Coordenada_X%3D" + coord[0];
            url = url + "%26Coordenada_Y%3D" + coord[1];


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
                    console.debug(ldt)
                    for (i =0; i < ldt.length; i++){
                        console.debug(ldt[i].textContent)
                    }

                    var pc1 = xmlDoc.getElementsByTagName("pc1");
                    var pc2 = xmlDoc.getElementsByTagName("pc2");
                    var array = [];
                    for (i =0; i < pc1.length; i++){
                        var refcat = pc1[i].textContent + pc2[i].textContent
                        console.debug(refcat);
                        array.push(refcat);
                    }
                    alert("Referencia catastral: "+refcat);


                    /*var cp = xmlDoc.getElementsByTagName("cp");
                    console.log("Codigo provincia: " + cp [0].textContent);*/
                    //

                    doGeoCodingCall();
                    //kmlFetch(array);
                }
            );
        }
        /*
         function kmlFetch(array){
         //https://www1.sedecatastro.gob.es/Cartografia/FXCC/FXCC_KML.aspx?refcat=6849602UM5064N

         var proxy = 'http://dev.mobivap.es/~voxel/api/xml2json.php';
         var uri = proxy + '?url='
         uri = uri + "https://www1.sedecatastro.gob.es/Cartografia/FXCC/FXCC_KML.aspx?refcat=6849602UM5064N";

         $.ajax({
         url: uri,
         type: 'POST',
         success: function() {
         console.debug("All")
         }
         }).done(function (data){
         console.debug(data)
         });
         }*/

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

        function loadTree(mapa) {
            var tree = new layerTree({map: mapa.getOLMap(), target: 'layertree', messages: 'messageBar'})
            mapa.getOLMap().getLayers().forEach(function (lay) {
                var layer = lay;
                tree.createRegistry(layer);
            });
        }

        /*****************************************************************************/
        /* GEOCODING                                                                 */
        /*****************************************************************************/
        // Añadimos el control para geocoding
        var geocoder = new Geocoder('nominatim', {
            provider: 'osm',
            lang: 'es-ES',
            placeholder: 'Buscar ubicación ...',
            limit: 5,
            keepOpen: true
        });
        olMap.addControl(geocoder);

        // Añadimos el listener del geocoder
        geocoder.on('addresschosen', function(evt){
            var
                feature = evt.feature,
                coord = evt.coordinate,
                address_html = feature.get('address_html')
                ;
            content.innerHTML = '<p>'+address_html+'</p>';
            overlay.setPosition(coord);
        });



    };

    function myFunction2(){
        console.log ("OBLIQUE LOADED");
    }

    function myFunction3(){
        console.log ("OBLIQUE CENTERED");
    }

    function myFunction4(){
        console.log ("ORTHO LOADED");


    }

    function myFunction5(){
        console.log ("ORTHO CENTERED");
    }

    function myFunction6(){
        console.log ("ADDED OBLI LAYERS");
    }

    function myFunction7(args){
        console.log ("FIRED ERROR");

        console.debug(args);
    }


    // Creamos el objeto WME en el div "mimapa"
    var newMap = new WME.Map("mimapa", {
        usertoken : '333val09user14585',
        x : -40200,
        y : 4790000,
        loadAnimation : true,
        controls : 'all',
        events : [{ name : 'addedBaseLayers', callback : myFunction },
            { name : 'addedObliBaseLayers', callback : myFunction6 },
            { name : 'loadedOblique', callback : myFunction2 },
            { name : 'positionedOblique', callback : myFunction3 },
            { name : 'loadedOrtho', callback : myFunction4 },
            { name : 'positionedOrtho', callback : myFunction5 },
            { name : 'firedError', callback : myFunction7 }]
    });

    newMap.addLayer(pnoa, "PNOA");
    newMap.addLayer(catastro, "Catastro");
};
