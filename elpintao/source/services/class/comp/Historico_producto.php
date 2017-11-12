<?php

require_once("Base.php");

class class_Historico_producto extends class_Base
{
  
  
  public function method_leer_historico_producto($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = array();
  	
  	
  	
  	
	$sql = "SELECT log.* FROM producto INNER JOIN log ON producto.id_producto=log.id WHERE (log.descrip='Alta producto' OR log.descrip='Modificar producto' OR log.descrip='Eliminar producto')";
	
	if (! is_null($p->desde) && ! is_null($p->hasta)) {
		$sql.= " AND (DATE(log.fecha) BETWEEN '" . substr($p->desde, 0, 10) . "' AND '" . substr($p->hasta, 0, 10) . "')";
	} else if (! is_null($p->desde)) {
		$sql.= " AND DATE(log.fecha) >= '" . substr($p->desde, 0, 10) . "'";
	} else if (! is_null($p->hasta)) {
		$sql.= " AND DATE(log.fecha) <= '" . substr($p->hasta, 0, 10) . "'";
	}
	
	if ($p->id_fabrica > "0") {
		$sql.= " AND producto.id_fabrica=" . $p->id_fabrica;
	}
	
	$sql.= " ORDER BY log.fecha DESC";
	
	
	$rsProducto = $this->mysqli->query($sql);
	while ($rowProducto = $rsProducto->fetch_object()) {
		$rowProducto->log_descrip = $rowProducto->descrip;
		
		$json = json_decode($rowProducto->texto);
		
		foreach($json as $key => $value) {
			$rowProducto->{$key} = $value;
		}
		
		unset($rowProducto->texto);
		unset($rowProducto->serializer);
		
		$sql = "SELECT descrip FROM fabrica WHERE id_fabrica=" . $rowProducto->id_fabrica;
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		
		$rowProducto->fabrica_descrip = $row->descrip;
		
		$sql = "SELECT descrip, simbolo FROM moneda WHERE id_moneda=" . $rowProducto->id_moneda;
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		
		$rowProducto->moneda_descrip = $row->descrip . " (" . $row->simbolo . ")";
		
		$resultado[] = $rowProducto;
	}

	
	return $resultado;
  }
  

  public function method_leer_historico_producto_item($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = array();
  	
  	
	$sql = "SELECT log.* FROM producto_item INNER JOIN log ON producto_item.id_producto_item = log.id WHERE (log.descrip='Alta producto_item' OR log.descrip='Modificar producto_item' OR log.descrip='Eliminar producto_item') AND producto_item.id_producto=" . $p->id_producto . " ORDER BY fecha DESC";
	
	$rsItem = $this->mysqli->query($sql);
	while ($rowItem = $rsItem->fetch_object()) {
		$rowItem->log_descrip = $rowItem->descrip;
		
		$json = json_decode($rowItem->texto);
		
		foreach($json as $key => $value) {
			$rowItem->{$key} = $value;
		}
		
		unset($rowItem->texto);
		unset($rowItem->busqueda);
		
		$sql = "SELECT descrip FROM color WHERE id_color=" . $rowItem->id_color;
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		
		$rowItem->color_descrip = $row->descrip;
		
		$sql = "SELECT descrip FROM unidad WHERE id_unidad=" . $rowItem->id_unidad;
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		
		$rowItem->unidad_descrip = $row->descrip;
		
		
		$resultado[] = $rowItem;
	}

	
	return $resultado;
  }
}

?>