<?php

require_once("Conexion.php");

session_start();

if (isset($_SESSION['conexion'])) {
	$_SESSION['conexion']->ocupada = true;
} else {
	$_SESSION['conexion'] = $conexion;
}


class class_Conexion2
{


  public function method_leer_conexion($params, $error) {
	
	return $_SESSION['conexion'];
  }
}

?>