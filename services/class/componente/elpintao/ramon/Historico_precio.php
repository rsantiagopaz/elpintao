<?php

require_once("Base_elpintao.php");

class class_Historico_precio extends class_Base_elpintao
{


  public function method_leer_historico($params, $error) {
	$p = $params[0];

	$opciones = array("iva"=>"float", "desc_fabrica"=>"float", "desc_producto"=>"float", "precio_lista"=>"float", "remarc_final"=>"float", "remarc_mayorista"=>"float", "desc_final"=>"float", "desc_mayorista"=>"float", "bonif_final"=>"float", "bonif_mayorista"=>"float", "comision_vendedor"=>"float");
	$sql = "SELECT * FROM historico_precio WHERE id_producto_item=" . $p->id_producto_item . " ORDER BY fecha";
	return $this->toJson($this->mysqli->query($sql), $opciones);
  }
  

  public function method_buscar_producto_item($params, $error) {
	$p = $params[0];
	
	$sql = "SELECT producto_item.id_producto_item, fabrica.descrip AS fabrica, producto.descrip AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad";
	$sql.= " FROM ((((producto INNER JOIN fabrica USING(id_fabrica)) INNER JOIN producto_item USING (id_producto)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE producto_item.activo";
	
	if (is_null($p->cod_barra)) {
		$descrip = explode(" ", $p->descrip);
		foreach ($descrip as $palabra) {
			if (!empty($palabra)) {
				if (is_numeric($palabra)) {
					$sql.= " AND producto_item.cod_interno LIKE '" . $palabra . "'";
				} else if ($palabra[0]=="*") {
					$sql.= " AND producto_item.capacidad LIKE '" . substr($palabra, 1) . "%'";
				} else {
					$sql.= " AND producto_item.busqueda LIKE '%" . $palabra . "%'";
				}
			}
		}
	} else {
		$sql.= " AND producto_item.cod_barra='" . $p->cod_barra . "'";
	}

	$sql.=" ORDER BY fabrica, producto, color, unidad, capacidad";

	$opciones = array("capacidad"=>"float");
	return $this->toJson($this->mysqli->query($sql), $opciones);
  }
}

?>