<?php

require_once("Conexion.php");

set_time_limit(120);

$mysqli = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
$mysqli->query("SET NAMES 'utf8'");


switch ($_REQUEST['rutina']) {
case 'leer_mensaje': {

$resultado=array();

$sql = "SELECT * FROM mensaje ORDER BY id_mensaje DESC";
$rs = $mysqli->query($sql);

while ($row = $rs->fetch_object()) {
	$row->mostrar = (bool) $row->mostrar;
	$row->json = json_decode($row->json);
	$row->json->mensaje = html_entity_decode($row->json->mensaje);
	$resultado[] = $row;
}

if (count($resultado) > 0) {
	$sql = "UPDATE mensaje SET mostrar=FALSE WHERE id_mensaje=" . $resultado[0]->id_mensaje;
	$mysqli->query($sql);
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

$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
	$resultado[] = $reg;
}

header('Content-Type: application/json');
echo json_encode($resultado);

break;
}



case 'leer_moneda': {

$resultado=array();

$sql = "SELECT * FROM moneda";
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
$rs = $mysqli->query($sql);
while ($reg = $rs->fetch_object()) {
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
			$rs = $mysqli->query($sql);
			$reg = $rs->fetch_object();
			$padre = posicionarNodo($reg);
		}
		$padre->hijos[] = $hijo;
	}
	return $hijo;
}

?>