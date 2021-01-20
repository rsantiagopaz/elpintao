<?php

require_once("Reparacion.php");

$reparacion = new class_Reparacion;
$params = array();
$error = new stdClass;

$resultado = $reparacion->method_arreglar_cuentas($params, $error);

echo "<br/>";
echo count($resultado) . "<br/>";
echo json_encode($resultado);

?>
