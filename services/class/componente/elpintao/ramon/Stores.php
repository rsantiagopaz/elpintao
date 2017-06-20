<?php

session_start();

set_time_limit(120);

$link1 = mysql_connect($_SESSION['conexion']->servidor, $_SESSION['conexion']->usuario, $_SESSION['conexion']->password);
mysql_select_db($_SESSION['conexion']->database, $link1);
mysql_query("SET NAMES 'utf8'", $link1);


switch ($_REQUEST['rutina']) {
case 'leer_mensaje': {

$resultado=array();

$sql = "SELECT * FROM mensaje ORDER BY id_mensaje DESC";
$rs = mysql_query($sql);

while ($row = mysql_fetch_object($rs)) {
	$row->mostrar = (bool) $row->mostrar;
	$row->json = json_decode($row->json);
	$row->json->mensaje = html_entity_decode($row->json->mensaje);
	$resultado[] = $row;
}

if (count($resultado) > 0) {
	$sql = "UPDATE mensaje SET mostrar=FALSE WHERE id_mensaje=" . $resultado[0]->id_mensaje;
	mysql_query($sql);
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}


case 'leer_arbol': {

$agregados=array();
$arbol=array();

if ($_REQUEST['descrip']=="") {
	$sql = "SELECT * FROM arbol ORDER BY id_arbol";
} else {
	$sql ="(SELECT * FROM arbol WHERE id_arbol = ANY (SELECT id_arbol FROM producto WHERE descrip LIKE '%" . $_REQUEST['descrip'] . "%'))";
	$sql.=" UNION DISTINCT"; 
	$sql.=" (SELECT * FROM arbol WHERE descrip LIKE '%" . $_REQUEST['descrip'] . "%')";
	$sql.=" ORDER BY id_arbol";	
}

$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$reg->cant_hijos = (int)$reg->cant_hijos;
	$reg->cant_productos = (int)$reg->cant_productos;
	posicionarNodo($reg);
}

header('Content-Type: application/json');
echo json_encode($arbol[0]);

break;
}



case 'leer_transporte': {

$resultado=array();

$sql = "SELECT * FROM transporte";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$reg->repone = (bool) $reg->repone;
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_unidad': {

$resultado=array();

$sql = "SELECT id_unidad, descrip FROM unidad";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_moneda': {

$resultado=array();

$sql = "SELECT * FROM moneda";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$reg->cotizacion = (float) $reg->cotizacion;
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_usuario': {

$resultado=array();

$sql = "SELECT * FROM usuario ORDER BY nick";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$reg->nro_vendedor = (int) $reg->nro_vendedor;
	$reg->password = "";
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_fabrica': {

$resultado=array();

$sql = "SELECT * FROM fabrica ORDER BY descrip";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$reg->desc_fabrica = (float) $reg->desc_fabrica;
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_color': {

$resultado=array();

$sql = "SELECT id_color, descrip FROM color ORDER BY descrip";
$rs = mysql_query($sql);
while ($reg = mysql_fetch_object($rs)) {
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}

}



function posicionarNodo(&$hijo) {
	global $agregados, $arbol;
	
	$hijo->hijos = array();
	$agregados[$hijo->id_arbol] = $hijo;
	
	if ($hijo->id_padre=='0') {
		$arbol[] = $hijo;
	} else {
		$padre = $agregados[$hijo->id_padre];
		if (is_null($padre)) {
			$sql = "SELECT * FROM arbol WHERE id_arbol=" . $hijo->id_padre;
			$rs = mysql_query($sql);
			$reg = mysql_fetch_object($rs);
			$padre = posicionarNodo($reg);
		}
		$padre->hijos[] = $hijo;
	}
	return $hijo;
}

?>