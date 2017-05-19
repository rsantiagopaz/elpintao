<?php

require_once("class/comp/Conexion.php");

if( !ini_get('safe_mode') ) {
	set_time_limit(0);
}

require_once("class/comp/Transmision_SA.php");

$Transmision_SA = new class_Transmision_SA;
$Transmision_SA->method_transmitir("", "");

?>
