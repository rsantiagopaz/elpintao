<?php

require_once("Base.php");

class class_Vales extends class_Base
{


  public function method_leer_vales($params, $error) {
  	$p = $params[0];
  	

	$sql = "SELECT";
	$sql.= " valesmercaderia.*, sucursal.descrip AS sucursal_descrip";
	$sql.= " FROM valesmercaderia INNER JOIN sucursal ON valesmercaderia.id_sucursal_retira = sucursal.id_sucursal";
	$sql.= " WHERE TRUE";
	
	if (! is_null($p->desde)) {
		$sql.= " AND DATE(fyh) >= '" . substr($p->desde, 0, 10) . "'";
	} else if (! is_null($p->hasta)) {
		$sql.= " AND DATE(fyh) <= '" . substr($p->hasta, 0, 10) . "'";
	}
	
	if ($p->id_sucursal > "0") {
		if ($p->genera) {
			$sql.= " AND id_sucursal_genera=" . $p->id_sucursal;
		} else {
			$sql.= " AND id_sucursal_retira=" . $p->id_sucursal;
		}
	}
	
	$sql.= " ORDER BY fyh DESC";
	
	return $this->toJson($sql);
	
  }
  
  
  public function method_leer_detalle($params, $error) {
  	$p = $params[0];
  	

  	$opciones = new stdClass;
	$opciones->functionAux = function (&$row, $col) {
		$row->capacidad = (float) $row->capacidad;
		$row->cantidad = (float) $row->cantidad;
  	};

	$sql = "SELECT producto_item.id_producto_item, producto_item.id_unidad, producto_item.precio_lista, fabrica.descrip AS fabrica, producto.descrip AS producto, producto.iva, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad, cantidad";
	$sql.= " FROM (((((valesmercaderia_items INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE valesmercaderia_items.id_valemercaderia='" . $p->id_valemercaderia . "'";
	
	return $this->toJson($sql, $opciones);

  }
}

?>