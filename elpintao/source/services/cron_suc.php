<?php

require_once("class/comp/Transmision_SA.php");

if( !ini_get('safe_mode') ) {
	set_time_limit(0);
}

$Transmision_SA = new class_Transmision_SA;
$Transmision_SA->method_transmitir("", "");

?>
