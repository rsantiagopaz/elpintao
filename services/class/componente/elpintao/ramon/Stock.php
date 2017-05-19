<?php

class class_Stock
{
  public function method_leer_stock($params, $error) {
	$p = $params[0];
	
	$resultado = new stdClass;
	$resultado->id_sucursal = $p->id_sucursal;
	$resultado->producto_item = array();

	$link = mysql_connect($p->url, $p->username, $p->password);
	mysql_select_db($p->base, $link);
	mysql_query("SET NAMES 'utf8'", $link);
	
	$sql = "SELECT producto.id_producto, producto_item.id_producto_item, stock.stock FROM (producto INNER JOIN producto_item USING(id_producto)) INNER JOIN stock USING(id_producto_item) WHERE producto_item.id_producto=" . $p->id_producto . " AND stock.id_sucursal=" . $p->id_sucursal;
	$rs = mysql_query($sql);
	if (mysql_num_rows($rs) > 0) {
		while ($row = mysql_fetch_object($rs)) {
			$row->stock = (int) $row->stock;
			
			$resultado->producto_item[] = $row;
		}
		
		return $resultado;
	} else {
		$error->SetError(0, "item no encontrado");
		
		return $error;
	}
  }
  
  
  public function method_escribir_stock($params, $error) {
	$p = $params[0];
	
	$link = mysql_connect($p->url, $p->username, $p->password);
	mysql_select_db($p->base, $link);
	mysql_query("SET NAMES 'utf8'", $link);
	
	$sql = "UPDATE stock SET stock=" . $p->stock . ", transmitir=TRUE WHERE id_producto_item=" . $p->id_producto_item . " AND id_sucursal=" . $p->id_sucursal;
	mysql_query($sql);
  }
  
  
  public function method_leer_productos($params, $error) {
	$p = $params[0];
	
	$resultado = new stdClass;
	$resultado->producto_item = array();
	
	$link = mysql_connect($p->url, $p->username, $p->password);
	mysql_select_db($p->base, $link);
	mysql_query("SET NAMES 'utf8'", $link);
	
	$sql = "SELECT";
	$sql.= " producto.*, fabrica.descrip AS fabrica, fabrica.desc_fabrica";
	$sql.= " FROM producto INNER JOIN fabrica USING (id_fabrica)";
	$sql.= " WHERE producto.activo AND id_producto=" . $p->id_producto;
	$rs = mysql_query($sql);
	$producto = mysql_fetch_object($rs);
	$producto->desc_producto = (float) $producto->desc_producto;
	$producto->desc_fabrica = (float) $producto->desc_fabrica;
	$producto->iva = (float) $producto->iva;

	$resultado->producto = $producto;
	
	
	$sql = "SELECT";
	$sql.= " producto_item.id_producto_item, producto_item.capacidad, unidad.descrip AS unidad, color.descrip AS color";
	$sql.= " FROM (producto_item INNER JOIN unidad USING (id_unidad)) INNER JOIN color USING (id_color)";
	$sql.= " WHERE producto_item.activo AND id_producto=" . $p->id_producto;
	$sql.= " ORDER BY color, unidad, producto_item.capacidad";
	
	$rs = mysql_query($sql);
	while ($row = mysql_fetch_object($rs)) {
		$row->capacidad = (float) $row->capacidad;
		$row->duracion = (float) $row->duracion;
		$row->stock = 0;
		$row->stsuc = 0;
		$row->stock_bandera = -1;
		$row->stsuc_bandera = -1;

		$resultado->producto_item[] = $row;
	}
	
	return $resultado;
  }
}

?>