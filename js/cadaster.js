/***
 Función:       getRefcat
 Argumentos:    coord (array) - coordenadas de un punto
 epsg (string) - código EPSG del sistema de coordenadas
 div (string)  - id del DIV en el que se mostrarán los resultados
 Consulta:      Consulta_RCCCOOR
 Descripción:   Servicio de consulta de Referencia Catastral por Coordenadas.
 Muestra las coordenadas en un div que se pasa como argumento
 ***/

function getRefcat(coord, epsg, div) {
    var refcat = null;

    var urlserv = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx";
    var consulta = "Consulta_RCCOOR";

    var simb_interrogacion = '%3F';
    var simb_ampersand = '%26';
    var simb_igual = '%3D';

    console.log("Coordenadas: " + coord);
    console.log("EPSG: " + epsg);

    var proxy = 'http://voxel3d.tk/api/scripts/xml2json.php';
    var url = proxy + '?url=' + urlserv + "/" + consulta + simb_interrogacion;
    url = url + "SRS" + simb_igual +"EPSG" + "%253A" + epsg;
    url = url + simb_ampersand + "Coordenada_X" + simb_igual + coord[0];
    url = url + simb_ampersand + "Coordenada_Y" + simb_igual + coord[1];
    // console.log(url);

    // Croos Domain Proxy in VOXEL WME API
    // Not necesary reimplement the proxy in local server
    $.ajax({
        url: url,
        type: 'GET',
        crossDomain: true,
        dataType: "jsonp",
        success: function () {
            console.debug("All");
        }
    }).done(
        function (xmlresponse) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlresponse['contents'], "text/xml"); // Respuesta en formato XML
            //var ldt = xmlDoc.getElementsByTagName("ldt");
            var pc1 = xmlDoc.getElementsByTagName("pc1"); // Primera parte de la RC
            var pc2 = xmlDoc.getElementsByTagName("pc2"); // Segunda parte de la RC
            refcat = pc1[0].textContent + pc2[0].textContent;

            // Mostramos resultados en la consola
            //console.debug(xmlDoc);
            //console.debug(ldt);
            //console.debug(pc1);
            //console.debug(pc2);
            var divId = '#' + div;
            var resultado = "Referencia catastral: " + "<b>" + refcat + "</b>";
            $(divId).html(resultado);
        }
    );
}



/***
 Consulta:    Consulta_RCCCOOR_Distancia
 Descripción: Servicio de consulta lista de Referencias Catastrales por distancia a unas Coordenadas.
 ***/

function consulta_RCCOOR_Distancia(coord) {
    var urlserv = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/";
    var consulta = "Consulta_RCCOOR_Distancia";
    var epsg = "3857";

    var proxy = 'http://voxel3d.tk/api/scripts/xml2json.php';
    var url = proxy + '?url=' + urlserv + consulta + "%3FSRS%3DEPSG%253A" + epsg;
    url = url + "%26Coordenada_X%3D" + coord[0];
    url = url + "%26Coordenada_Y%3D" + coord[1];

    // Croos Domain Proxy in VOXEL WME API
    // Not necesary reimplement the proxy in local server
    $.ajax({
        url: url,
        type: 'GET',
        crossDomain: true,
        dataType: "jsonp",
        success: function () {
            console.debug("All")
        }
    }).done(
        function (xmlresponse) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlresponse['contents'], "text/xml");

            console.debug(xmlDoc);
            var ldt = xmlDoc.getElementsByTagName("ldt");
            console.debug(ldt)
            for (i = 0; i < ldt.length; i++) {
                console.debug(ldt[i].textContent)
            }

            var pc1 = xmlDoc.getElementsByTagName("pc1");
            var pc2 = xmlDoc.getElementsByTagName("pc2");
            var array = [];
            for (i = 0; i < pc1.length; i++) {
                var refcat = pc1[i].textContent + pc2[i].textContent
                console.debug(refcat);
                array.push(refcat);
            }
        }
    );
}


/***
 Consulta:    Consulta_DNPRC_Codigos
 Descripción: Consulta de DATOS CATASTRALES NO PROTEGIDOS de un inmueble identificado por su Referencia Catastral
 ***/

function consulta_DNPRC_Codigos(refcat) {
    var urlserv = "http://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejeroCodigos.asmx";
    var consulta = "Consulta_DNPRC_Codigos";
    // var epsg = "3857";
    var cp = '47';
    var cm = '186';
    var simb_interrogacion = '%3F';
    var simb_ampersand = '%26';
    var simb_igual = '%3D';


    var proxy = 'http://voxel3d.tk/api/scripts/xml2json.php';
    var url = proxy + '?url=' + urlserv + '/' + consulta + simb_interrogacion;
    url = url + "CodigoProvincia" + simb_igual + cp;
    url = url + simb_ampersand + "CodigoMunicipio" + simb_igual + cm;
    url = url + simb_ampersand + "CodigoMunicipioINE" + simb_igual + cp + cm;
    url = url + simb_ampersand + "RC" + simb_igual + refcat;
    console.log (url);


    // Croos Domain Proxy in VOXEL WME API
    // Not necesary reimplement the proxy in local server
    $.ajax({
        url: url,
        type: 'GET',
        crossDomain: true,
        dataType: "jsonp",
        success: function () {
            console.debug("All")
        }
    }).done(
        function (xmlresponse) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlresponse['contents'], "text/xml"); // Respuesta en formato XML
            //var ldt = xmlDoc.getElementsByTagName("ldt");
            /* var pc1 = xmlDoc.getElementsByTagName("pc1"); // Primera parte de la RC
             var pc2 = xmlDoc.getElementsByTagName("pc2"); // Segunda parte de la RC
             var refcat = pc1[0].textContent + pc2[0].textContent;
             */
            // Mostramos resultados en la consola
            console.debug(xmlDoc);
            //console.debug(ldt);
            //console.debug(pc1);
            //console.debug(pc2);
            //console.debug(refcat);
        }
    );
}