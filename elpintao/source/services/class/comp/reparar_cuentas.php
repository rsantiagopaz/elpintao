<?php

require_once("Reparacion.php");
$fe = new class_Reparacion;
$resultado = $fe->method_arreglar_cuentas(null, null);
echo json_encode($resultado);

?>
