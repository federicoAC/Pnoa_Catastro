

function MenuOnOff(){
	var miMenu=document.getElementById("envuelta");
/*	alert(miMenu.style.display);*/
	miMenu.style.display = (miMenu.style.display != "none") ? "none" : "inline";
};

function DibujoOnOff(){
	var miDibujo=document.getElementById("dibujo");
/*	alert(miDibujo.style.display);*/
	miDibujo.style.display = (miDibujo.style.display != "none") ? "none" : "inline";
};

function SocialOnOff(){
	var miSocial=document.getElementById("social");
	/*	alert(miSocial.style.display);*/
	miSocial.style.display = (miSocial.style.display != "none") ? "none" : "block";
};

function imprimir(){
		if (window.print())
		window.print();
		else
		alert("Para imprimir presione Crtl+Shift+P");

};
/*
function imprSelec(nombre)
{
  var ficha = document.getElementById(nombre);
  var ventimp = window.open(' ', 'popimpr');
  ventimp.document.write( ficha.innerHTML );
  ventimp.document.close();
  ventimp.print( );
  ventimp.close();
};
*/
function funcionGenerica(){
	alert("funcion generica");
};