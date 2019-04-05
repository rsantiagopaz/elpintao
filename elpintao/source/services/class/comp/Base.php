<?php

session_start();

require_once($_SESSION['conexion']->require_elpintao_services . "class/componente/elpintao/ramon/" . "Base_elpintao.php");

class class_Base extends class_Base_elpintao
{


  public function method_leer_version($params, $error) {
  	
  	$aux = new stdClass;
  	$aux->id_version = 3;
	
	return $aux;
  }
}

?>