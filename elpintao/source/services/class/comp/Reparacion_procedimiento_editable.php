<?php

require_once("Reparacion.php");

$reparacion = new class_Reparacion;
$params = array();
$error = new stdClass;

$resultado = $reparacion->method_arreglar_stock(null, null);

echo "<br/>";
echo count($resultado) . "<br/>";
echo json_encode($resultado);

?>
