<?php

session_start();

set_time_limit(0);

/*
$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "root";
$aux->password = "";
$aux->database = "deposito";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/xampplite/htdocs/openworks-qx/5.x/elpintao/services/";
$aux->require_general_services = "/xampplite/htdocs/openworks-qx/5.x/general/services/";
*/


/*
$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "root";
$aux->password = "";
$aux->database = "elpintao";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/xampplite/htdocs/openworks-qx/5.x/elpintao/services/";
$aux->require_general_services = "/xampplite/htdocs/openworks-qx/5.x/general/services/";
*/




$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "elpintao";
$aux->password = "1qaz2wsx";
$aux->database = "deposito";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/var/www/elpintao/services/";
$aux->require_general_services = "/var/www/general/services/";




/*
$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "elpintao";
$aux->password = "1qaz2wsx";
$aux->database = "elpintao";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/var/www/elpintao/services/";
$aux->require_general_services = "/var/www/general/services/";
*/








/*
$_SESSION['servidor'] = "localhost";
$_SESSION['usuario'] = "root";
$_SESSION['password'] = "";
$_SESSION['base'] = "elpintao";
$_SESSION['services_require'] = "../../../services/class/comp/elpintao/ramon/";
*/



/*
$_SESSION['servidor'] = "localhost";
$_SESSION['usuario'] = "root";
$_SESSION['password'] = "";
$_SESSION['base'] = "deposito";
$_SESSION['services_require'] = "../../../services/class/comp/elpintao/ramon/";
*/





/*
$_SESSION['servidor'] = "localhost";
$_SESSION['usuario'] = "elpintao";
$_SESSION['password'] = "1qaz2wsx";
$_SESSION['base'] = "elpintao";
$_SESSION['services_require'] = "../../../services/class/comp/elpintao/ramon/";
*/




/*
$_SESSION['servidor'] = "localhost";
$_SESSION['usuario'] = "elpintao";
$_SESSION['password'] = "1qaz2wsx";
$_SESSION['base'] = "deposito";
$_SESSION['services_require'] = "../../../services/class/comp/elpintao/ramon/";
*/



$_SESSION['conexion'] = $aux;



$resultado = array();

$mysqli = new mysqli($_SESSION['conexion']->servidor, $_SESSION['conexion']->usuario, $_SESSION['conexion']->password, $_SESSION['conexion']->database);
$mysqli->query("SET NAMES 'utf8'");

$sql = "SELECT * FROM transmision_log_sal";
$rs = $mysqli->query($sql);

while ($row = $rs->fetch_object()) {
	$sql = "SELECT * FROM transmision_log_ent WHERE id_sucursal=" . $row->id_sucursal . " AND sql_texto='" . $mysqli->real_escape_string($row->sql_texto) . "'";
	$rs2 = $mysqli->query($sql);
	if ($rs2->num_rows == 0) $resultado[] = $row;
}

foreach ($resultado as $item) {
	echo $item->sql_texto . "<br/><br/><br/>";
}


?>