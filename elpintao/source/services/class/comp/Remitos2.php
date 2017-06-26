<?php

require_once("Base.php");

class class_Remitos2 extends class_Base
{
  
  
  public function method_resumen_remitos($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = array();
  	
	$sql = "SELECT DISTINCTROW remito_emi.*, CASE WHEN id_sucursal_para<>0 THEN sucursal.descrip ELSE remito_emi.destino END AS destino_descrip, CASE remito_emi.estado WHEN 'R' THEN 'Registrado' ELSE 'Autorizado' END AS estado_descrip";
	$sql.= " FROM remito_emi LEFT JOIN sucursal ON remito_emi.id_sucursal_para = sucursal.id_sucursal";
	$sql.= " WHERE TRUE";
	
	if ($p->estado == "Registrado") {
		$sql.= " AND remito_emi.estado='R'";
	} else if ($p->estado == "Autorizado") {
		$sql.= " AND remito_emi.estado='A'";
	}
	
	if (! is_null($p->desde) && ! is_null($p->hasta)) {
		$sql.= " AND (DATE(remito_emi.fecha) BETWEEN '" . substr($p->desde, 0, 10) . "' AND '" . substr($p->hasta, 0, 10) . "')";
	} else if (! is_null($p->desde)) {
		$sql.= " AND DATE(remito_emi.fecha) >= '" . substr($p->desde, 0, 10) . "'";
	} else if (! is_null($p->hasta)) {
		$sql.= " AND DATE(remito_emi.fecha) <= '" . substr($p->hasta, 0, 10) . "'";
	}
	
	if ($p->id_sucursal > "0") {
		$sql.= " AND id_sucursal_para=" . $p->id_sucursal;
	}
	
	/*
	if ($p->id_fabrica > "0") {
		$sql.= " AND producto.id_fabrica=" . $p->id_fabrica;
	}

	if (! empty($p->buscar)) {
		$descrip = explode(" ", $p->buscar);
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
	}
	*/
	
	$sql.= " ORDER BY id_remito_emi DESC";


	$rsRemito = $this->mysqli->query($sql);
	while ($rowRemito = $rsRemito->fetch_object()) {
		$sql = "SELECT remito_emi_detalle.cantidad, fabrica.descrip AS fabrica, fabrica.desc_fabrica, producto.descrip AS producto, producto.iva, producto.desc_producto, producto_item.*, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_emi_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_emi='" . $rowRemito->id_remito_emi . "'";
		
		if ($p->id_fabrica > "0") {
			$sql.= " AND producto.id_fabrica=" . $p->id_fabrica;
		}
	
		if (! empty($p->buscar)) {
			$descrip = explode(" ", $p->buscar);
			foreach ($descrip as $palabra) {
				if (!empty($palabra)) {
					if (is_numeric($palabra)) {
						$sql.= " AND producto_item.cod_interno LIKE '" . $palabra . "'";
					} else if ($palabra[0]=="*") {
						$sql.= " AND producto_item.capacidad LIKE '" . substr($palabra, 1) . "%'";
					} else {
						$sql.= " AND producto.descrip LIKE '%" . $palabra . "%'";
					}
				}
			}
		}
		
		$rsRD = $this->mysqli->query($sql);
		while ($row = $rsRD->fetch_object()) {
			$row->capacidad = (float) $row->capacidad;
			$row->cantidad = (float) $row->cantidad;
			
			$row->precio_lista = (float) $row->precio_lista;
			$row->iva = (float) $row->iva;
			$row->desc_fabrica = (float) $row->desc_fabrica;
			$row->desc_producto = (float) $row->desc_producto;
			$row->remarc_final = (float) $row->remarc_final;
			$row->desc_final = (float) $row->desc_final;
			$row->bonif_final = (float) $row->bonif_final;
			$row->remarc_mayorista = (float) $row->remarc_mayorista;
			$row->desc_mayorista = (float) $row->desc_mayorista;
			$row->bonif_mayorista = (float) $row->bonif_mayorista;
			$row->desc_lista = (float) $row->desc_lista;
			$row->comision_vendedor = (float) $row->comision_vendedor;
			
			$this->functionCalcularImportes($row);
			
			$row->nro_remito = $rowRemito->nro_remito;
			$row->fecha = $rowRemito->fecha;
			
			$resultado[] = $row;
		}
	}
	
	return $resultado;
  }
}

?>