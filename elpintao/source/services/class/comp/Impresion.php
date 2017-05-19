<?php
session_start();

set_time_limit(0);

$link1 = mysql_connect($_SESSION['servidor'], $_SESSION['usuario'], $_SESSION['password']);
mysql_select_db($_SESSION['base'], $link1);
mysql_query("SET NAMES 'utf8'", $link1);


switch ($_REQUEST['rutina']) {
case 'imprimir_pedext': {

	$resultado = new stdClass;

	$sql = "SELECT pedido_ext.*, transporte.descrip AS transporte, fabrica.descrip AS fabrica, fabrica.desc_fabrica";
	$sql.= " FROM (pedido_ext INNER JOIN fabrica USING(id_fabrica)) INNER JOIN transporte USING(id_transporte)";
	$sql.= " WHERE pedido_ext.id_pedido_ext='" . $_REQUEST['id_pedido_ext'] . "'";
	$rsR = mysql_query($sql);
	$rowR = mysql_fetch_object($rsR);
	$rowR->desc_fabrica = (float) $rowR->desc_fabrica;

	$sql = "SELECT pedido_ext_detalle.*, producto_item.cod_interno, producto.descrip AS producto, producto.iva, producto.desc_producto, producto_item.capacidad, producto_item.precio_lista, color.descrip AS color, unidad.descrip AS unidad";
	$sql.= " FROM ((((pedido_ext_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad)";
	$sql.= " WHERE id_pedido_ext='" . $_REQUEST['id_pedido_ext'] . "'";
	$sql.= " ORDER BY producto.descrip, color, unidad, capacidad";
	$rsD = mysql_query($sql);

 
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<title>Impresion Pedido Externo emitido</title>
</head>
<body>
<table style="font-family:arial; font-size:12px; " border="0" cellpadding=0 cellspacing=0 width="100%" height=1% align="center">
<tr><td align="center" colspan="6" style="font-family:arial; font-size:16px; font-weight:bold;"><big>Pedido Externo emitido</big></td></tr>
<tr><td align="center" colspan="6"><?php echo "Fecha emi.: " . $rowR->fecha ?></td></tr>
<tr><td align="center" colspan="6"><?php echo "Fábrica: " . $rowR->fabrica ?></td></tr>
<tr><td align="center" colspan="6"><?php echo "Telef.: " . $rowR->telefono ?></td></tr>
<tr><td align="center" colspan="6"><?php echo "e-mail: " . $rowR->email ?></td></tr>
<tr><td align="center" colspan="6"><?php echo "Transporte: " . $rowR->transporte ?></td></tr>
<tr><td align="center" colspan="6"><?php echo "Dom.entrega: " . $rowR->domicilio ?></td></tr>
<tr><td>&nbsp;</td></tr>
<tr><th>Cod.Int.</th><th>Producto</th><th>Color</th><th>Capacidad</th><td>&nbsp;</td><th>U.</th><th>Cantidad</th></tr>
<tr><td colspan="10"><hr></td></tr>

<?php
	while ($rowD = mysql_fetch_object($rsD)) {
		$rowD->cantidad = (int) $rowD->cantidad;
		$rowD->precio_lista = (float) $rowD->precio_lista;
		$rowD->iva = (float) $rowD->iva;
		$rowD->desc_producto = (float) $rowD->desc_producto;
		
		$rowD->plmasiva = $rowD->precio_lista + ($rowD->precio_lista * $rowD->iva / 100);
		
		$rowD->costo = $rowD->plmasiva;
		$rowD->costo = $rowD->costo - ($rowD->costo * $rowR->desc_fabrica / 100);
		$rowD->costo = $rowD->costo - ($rowD->costo * $rowD->desc_producto / 100);
		
		$resultado->{"Costo"} = $resultado->{"Costo"} + ($rowD->cantidad * $rowD->costo);
		$resultado->{"P.lis.+IVA"} = $resultado->{"P.lis.+IVA"} + ($rowD->cantidad * $rowD->plmasiva);
		$resultado->{$rowD->unidad} = $resultado->{$rowD->unidad} + ($rowD->cantidad * (float) $rowD->capacidad);
		
		if ((int) substr($rowD->capacidad, -3) == 0) {
			$rowD->capacidad = number_format((float) $rowD->capacidad, 0, ',', '.');
		} else {
			$rowD->capacidad = number_format((float) $rowD->capacidad, strlen(strrchr((string)(float) $rowD->capacidad, ".")) - 1, ',', '.');
		}
?>
		<tr><td><?php echo $rowD->cod_interno ?></td><td><?php echo $rowD->producto ?></td><td><?php echo $rowD->color ?></td><td align="right"><?php echo $rowD->capacidad ?></td><td>&nbsp;</td><td><?php echo $rowD->unidad ?></td><td align="right"><?php echo $rowD->cantidad ?></td></tr>
		<tr><td colspan="10"><hr></td></tr>
<?php
	}
?>
<tr><td>&nbsp;</td></tr>
<tr><td>&nbsp;</td></tr>
<tr><td colspan="6">&nbsp;</td><th>Total</th></tr>
<tr><td colspan="5">&nbsp;</td><td colspan="2"><hr></td></tr>
<?php
	foreach($resultado as $key => $value) {
?>
		<tr><td colspan="5">&nbsp;</td><td><?php echo $key; ?></td><td align="right"><?php echo number_format($value, 2, ',', '.'); ?></td></tr>
		<tr><td colspan="5">&nbsp;</td><td colspan="2"><hr></td></tr>
<?php
	}
?>
</table>
</body>
</html>
<?php

		
break;
}


case 'imprimir_pi_gral': {
	
ksort($_SESSION["pi_gral"]);

?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<title>Impresion de Pedidos Internos agrupados</title>
</head>
<body>
<table style="font-family:arial; font-size:12px; " border="0" cellpadding=0 cellspacing=2 width="100%" height=1% align="center">
<tr><td align="center" colspan="6" style="font-family:arial; font-size:16px; font-weight:bold;"><big>Pedidos Internos agrupados <?php echo $rowS->descrip; ?></big></td></tr>
<tr><td align="center" colspan="6">Fecha: <?php echo date("Y-m-d H:i:s"); ?></td></tr>
<tr><td>&nbsp;</td></tr>
<tr><th>Fábrica</th><th>Producto</th><th>Capacidad</th><th>U.</th><th>Color</th><th>Cantidad</th></tr>
<tr><td colspan="10"><hr></td></tr>

<?php
	foreach ($_SESSION["pi_gral"] as $rowD) {
	//while ($rowD = mysql_fetch_object($rsD)) {
		if (substr($rowD->capacidad, -3) == 0) {
			$rowD->capacidad = (int) $rowD->capacidad; 
		} else {
			$rowD->capacidad = number_format($rowD->capacidad, '2', ',', '.');
		}
?>
		<tr><td><?php echo $rowD->fabrica ?></td><td><?php echo $rowD->producto ?></td><td align="right"><?php echo $rowD->capacidad ?></td><td><?php echo $rowD->unidad ?></td><td><?php echo $rowD->color ?></td><td align="right"><?php echo $rowD->cantidad ?></td></tr>
		<tr><td colspan="10"><hr></td></tr>
<?php
	}
?>

</table>
</body>
</html>
<?php

unset($_SESSION["pi_gral"]);
		
break;
}


case 'imprimir_pedido_interno': {
	
$json = json_decode($_REQUEST['json']);

if ($_REQUEST['tipo']=="sucursal") {
	$sql="SELECT * FROM pedido_int WHERE id_pedido_int=" . $_REQUEST['id'];
	$rsP = mysql_query($sql);
	$rowP = mysql_fetch_object($rsP);
	
	$sql="SELECT pedido_int_detalle.*, fabrica.descrip AS fabrica, CONCAT(producto_item.cod_interno, ' - ', producto.descrip) AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad FROM ((((pedido_int_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_pedido_int='" . $_REQUEST['id'] . "' ORDER BY producto.descrip";
	$rsD = mysql_query($sql);
		
	$sql="SELECT sucursal.descrip FROM sucursal INNER JOIN paramet USING(id_sucursal)";
	$rsS = mysql_query($sql);
	$rowS = mysql_fetch_object($rsS);
} else {
	$sql="SELECT * FROM pedido_suc WHERE id_pedido_suc=" . $_REQUEST['id'];
	$rsP = mysql_query($sql);
	$rowP = mysql_fetch_object($rsP);
	
	$sql="SELECT pedido_suc_detalle.*, fabrica.descrip AS fabrica, CONCAT(producto_item.cod_interno, ' - ', producto.descrip) AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad FROM ((((pedido_suc_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_pedido_suc='" . $_REQUEST['id'] . "' ORDER BY producto.descrip ";
	$rsD = mysql_query($sql);
	
	$sql="SELECT sucursal.descrip FROM sucursal WHERE id_sucursal=" . $rowP->id_sucursal;
	$rsS = mysql_query($sql);
	$rowS = mysql_fetch_object($rsS);
}

 
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<title>Impresion de Pedido Interno</title>
</head>
<body>
<table style="font-family:arial; font-size:12px; " border="0" cellpadding=0 cellspacing=2 width="100%" height=1% align="center">
<tr><td align="center" colspan="6" style="font-family:arial; font-size:16px; font-weight:bold;"><big>Pedido Interno <?php echo $rowS->descrip; ?></big></td></tr>
<tr><td align="center" colspan="6">Fecha: <?php echo $rowP->fecha; ?></td></tr>
<tr><td>&nbsp;</td></tr>
<tr><th>Fábrica</th><th>Producto</th><th>Capacidad</th><th>U.</th><th>Color</th><th>Cantidad</th></tr>
<tr><td colspan="10"><hr></td></tr>

<?php
	while ($rowD = mysql_fetch_object($rsD)) {
		if (substr($rowD->capacidad, -3) == 0) {
			$rowD->capacidad = (int) $rowD->capacidad; 
		} else {
			$rowD->capacidad = number_format($rowD->capacidad, '2', ',', '.');
		}
?>
		<tr><td><?php echo $rowD->fabrica ?></td><td><?php echo $rowD->producto ?></td><td align="right"><?php echo $rowD->capacidad ?></td><td><?php echo $rowD->unidad ?></td><td><?php echo $rowD->color ?></td><td align="right"><?php echo $rowD->cantidad ?></td></tr>
		<tr><td colspan="10"><hr></td></tr>
<?php
	}
?>

</table>
</body>
</html>
<?php

		
break;
}

	
case 'imprimir_remito': {

if ($_REQUEST['emitir']=="true") {
	$sql="SELECT remito_emi.*, CASE WHEN id_sucursal_para<>0 THEN sucursal.descrip ELSE remito_emi.destino END AS destino_descrip, CASE remito_emi.estado WHEN 'R' THEN 'Registrado' ELSE 'Autorizado' END AS estado_descrip FROM remito_emi LEFT JOIN sucursal ON remito_emi.id_sucursal_para=sucursal.id_sucursal WHERE remito_emi.id_remito_emi='" . $_REQUEST['id_remito'] . "'";
	$rsR = mysql_query($sql);
	$rowR = mysql_fetch_object($rsR);

	$sql="SELECT remito_emi_detalle.*, fabrica.descrip AS fabrica, CONCAT(producto_item.cod_interno, ' - ', producto.descrip) AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_emi_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_emi='" . $_REQUEST['id_remito'] . "' ORDER BY producto.descrip ";
	$rsD = mysql_query($sql);
	
	$sql="SELECT descrip FROM sucursal INNER JOIN paramet USING(id_sucursal)";
	$rsSucursal = mysql_query($sql);
	$rowSucursal = mysql_fetch_object($rsSucursal);

	$sql="SELECT nick FROM usuario WHERE id_usuario=" . $rowR->id_usuario_autoriza_emi;
	$rsAutoriza = mysql_query($sql);
	if (mysql_num_rows($rsAutoriza) > 0) {
		$rowAutoriza = mysql_fetch_object($rsAutoriza);
	} else {
		$rowAutoriza = new stdClass;
		$rowAutoriza->nick = "";
	}
	
	$sql="SELECT nick FROM usuario WHERE id_usuario=" . $rowR->id_usuario_transporta;
	$rsTransporta = mysql_query($sql);
	if (mysql_num_rows($rsTransporta) > 0) {
		$rowTransporta = mysql_fetch_object($rsTransporta);
	} else {
		$rowTransporta = new stdClass;
		$rowTransporta->nick = "";
	}
} else {
	$sql="SELECT remito_rec.*, CASE WHEN id_sucursal_de<>0 THEN sucursal.descrip ELSE remito_rec.destino END AS destino_descrip, CASE remito_rec.estado WHEN 'R' THEN 'Registrado' ELSE 'Autorizado' END AS estado_descrip FROM remito_rec LEFT JOIN sucursal ON remito_rec.id_sucursal_de=sucursal.id_sucursal WHERE remito_rec.id_remito_rec='" . $_REQUEST['id_remito'] . "'";
	$rsR = mysql_query($sql);
	$rowR = mysql_fetch_object($rsR);

	$sql="SELECT remito_rec_detalle.*, fabrica.descrip AS fabrica, CONCAT(producto_item.cod_interno, ' - ', producto.descrip) AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_rec_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_rec='" . $_REQUEST['id_remito'] . "'";
	$rsD = mysql_query($sql);
}
 
//$sql = "SELECT movimiento.*, oas_usuarios.SYSusuario AS usuario FROM movimiento INNER JOIN salud1.oas_usuarios ON movimiento.id_oas_usuario_movimiento=oas_usuarios.id_oas_usuario WHERE id_bien=" . $_REQUEST['id_bien'] . " ORDER BY id_movimiento";
 
?>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<title>Impresion de Remito <?php echo (($_REQUEST['emitir']=="true") ? "emitido" : "recibido") ?></title>
</head>
<body>
<table style="font-family:arial; font-size:12px; " border="0" cellpadding=0 cellspacing=0 width="100%" height=1% align="center">
<tr><td align="center" colspan="6" style="font-family:arial; font-size:16px; font-weight:bold;"><big>Remito <?php echo $rowR->nro_remito ?></big></td></tr>
<tr><td align="center" colspan="6"><?php echo "Fecha: " . $rowR->fecha ?></td></tr>
<tr><td>&nbsp;</td></tr>

<?php
if ($_REQUEST['emitir']=="true") {
?>
	<tr><td align="center" colspan="6"><?php echo "De: " . $rowSucursal->descrip . " - Para: " . $rowR->destino_descrip ?></td></tr>
	<tr><td align="center" colspan="6"><?php echo "Autoriza: " . $rowAutoriza->nick . " - Transporta: " . $rowTransporta->nick ?></td></tr>
	<tr><td>&nbsp;</td></tr>
<?php
}
?>

<tr><th>Fábrica</th><th>Producto</th><th>Capacidad</th><th>U.</th><th>Color</th><th>Cantidad</th></tr>
<tr><td colspan="10"><hr></td></tr>

<?php
	while ($rowD = mysql_fetch_object($rsD)) {
		if (substr($rowD->capacidad, -3) == 0) {
			$rowD->capacidad = (int) $rowD->capacidad; 
		} else {
			$rowD->capacidad = number_format($rowD->capacidad, '2', ',', '.');
		}
?>
		<tr><td><?php echo $rowD->fabrica ?></td><td><?php echo $rowD->producto ?></td><td align="right"><?php echo $rowD->capacidad ?></td><td><?php echo $rowD->unidad ?></td><td><?php echo $rowD->color ?></td><td align="right"><?php echo $rowD->cantidad ?></td></tr>
		<tr><td colspan="10"><hr></td></tr>

<?php
	}
?>

</table>
</body>
</html>
<?php

		
break;
}


}

?>
<script>
window.print();
</script>
