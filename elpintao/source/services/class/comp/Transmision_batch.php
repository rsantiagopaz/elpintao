<?php

require("Conexion.php");

set_time_limit(0);

$link1 = mysql_connect($_SESSION['servidor'], $_SESSION['usuario'], $_SESSION['password']);
mysql_select_db($_SESSION['base'], $link1);
mysql_query("SET NAMES 'utf8'", $link1);

$sql = "SELECT * FROM paramet";
$rsParamet = mysql_query($sql);
$rowParamet = mysql_fetch_object($rsParamet);

$bandera = true;

switch ($_REQUEST['rutina']) {
case 'prueba': {

mysql_query("START TRANSACTION");


$sql = "INSERT clientes SET
           tipodoc_dnicuit = '2-4972462',
           tipo_doc = '2',
           dni_cuit = '4972462',
           razon_social = 'MARTA MARIA INSERRA',
           condicion_iva = 'C',
           dir_comercial = 'LEANDRO ALEM 425',
           dir_particular = '',
           tel_fijo = '',
           cel = '',
           email = ''
           ON DUPLICATE KEY UPDATE
           razon_social = 'MARTA MARIA INSERRA',
           condicion_iva = 'C',
           dir_comercial = 'LEANDRO ALEM 425',
           dir_particular = '',
           tel_fijo = '',
           cel = '',
           email = ''";
$rs = mysql_query($sql);

mysql_query("ROLLBACK");
break;


try {
	$sql = "SELECT * FROM transmision_batch WHERE id_sucursal=" . $rowParamet->id_sucursal . " ORDER BY id_transmision";
	$rs = mysql_query($sql);
	while ($row = mysql_fetch_object($rs)) {
		$id_transmision = $row->id_transmision;
		$sql = $row->sql_texto;
		mysql_query($sql);

		$sql = "DELETE FROM transmision_batch WHERE id_transmision = " . $row->id_transmision;
		//$sql = "UPDATE transmision_batch SET descrip='batch procesado' WHERE id_transmision = " . $row->id_transmision;
		mysql_query($sql);
		$id_transmision = "NULL";
	}
} catch (Exception $e) {
	$bandera = false;
	echo "descrip: " . $e->getMessage() . " | " . $sql . "\n, id_transmision: " . $id_transmision;
}
mysql_query("ROLLBACK");
		
echo "\n" . $bandera;

break;
}


case 'real': {


		
break;
}

}

?>