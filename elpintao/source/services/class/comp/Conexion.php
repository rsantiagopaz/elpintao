<?php

session_start();



$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "root";
$aux->password = "";
$aux->database = "deposito";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/xampp/htdocs/openworks-qx/5.x/elpintao/services/";
$aux->require_general_services = "/xampp/htdocs/openworks-qx/5.x/general/services/";



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



/*
$aux = new stdClass;
$aux->servidor = "localhost";
$aux->usuario = "elpintao";
$aux->password = "1qaz2wsx";
$aux->database = "deposito";

$aux->rpc_elpintao_services = "../../../elpintao/services/";
$aux->rpc_general_services = "../../../general/services/";

$aux->require_elpintao_services = "/var/www/elpintao/services/";
$aux->require_general_services = "/var/www/general/services/";
*/



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


class class_Conexion
{


  public function method_leer_conexion($params, $error) {
	
	return $_SESSION['conexion'];
  }
}

?>