<?php

require_once("Base.php");

class class_PedidosExt extends class_Base
{


  public function method_agregar_items($params, $error) {
  	$p = $params[0];

  	$this->mysqli->query("START TRANSACTION");
	
	foreach ($p->items as $item) {
		if ($item->cantidad > 0) {
			$sql = "SELECT * FROM pedido_ext_detalle WHERE id_pedido_ext=" . $p->id_pedido_ext . " AND id_producto_item=" . $item->id_producto_item;
			$rs = $this->mysqli->query($sql);
			if ($rs->num_rows == 0) {
				$sql = "INSERT pedido_ext_detalle SET id_pedido_ext = '" . $p->id_pedido_ext . "', id_producto_item = '" . $item->id_producto_item . "', cantidad = '" . $item->cantidad . "'";
				$this->mysqli->query($sql);
			}
		}
	}
	
	$this->mysqli->query("COMMIT");
  }
  
  
  public function method_eliminar_item($params, $error) {
  	$p = $params[0];

	$sql = "DELETE FROM pedido_ext_detalle WHERE id_pedido_ext=" . $p->id_pedido_ext . " AND id_producto_item=" . $p->id_producto_item;
	$this->mysqli->query($sql);
  }
  
  
  public function method_autocompletarFabrica($params, $error) {
  	$p = $params[0];
  	set_time_limit(120);
  	
  	if (isset($p->parametros)) {
  		$sql = "SELECT descrip AS label, id_fabrica AS model, fabrica.* FROM fabrica WHERE id_fabrica=" . $p->parametros->id_fabrica;
  	} else {
  		$sql = "SELECT descrip AS label, id_fabrica AS model, fabrica.* FROM fabrica WHERE descrip LIKE '%" . $p->texto . "%' ORDER BY label";
  	}
	
	return $this->toJson($sql);
  }


  public function method_recibir_pedido($params, $error) {
  	$p = $params[0];
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	$sql="INSERT remito_rec SET nro_remito='" . $p->nro_remito . "', tipo=0, id_sucursal_de=0, id_fabrica=" . $p->id_fabrica . ", fecha=NOW(), id_usuario_transporta=0, estado='R'";
	$this->mysqli->query($sql);
	$id_remito_rec = $this->mysqli->insert_id;
  	
	$sql = "UPDATE pedido_ext SET id_remito_rec=" . $id_remito_rec . ", recibido=TRUE, fecha_recibido=NOW() WHERE id_pedido_ext='" . $p->id_pedido_ext . "'";
	$this->mysqli->query($sql);
	
	//$sql = "INSERT stock_log SET descrip='PedidosExt.method_recibir_pedido', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
	//$this->mysqli->query($sql);
  	
	foreach ($p->detalle as $item) {
		//$sql = "UPDATE stock SET stock = stock + " . $item->total . " WHERE id_sucursal=" . $this->rowParamet->id_sucursal . " AND id_producto_item=" . $item->id_producto_item . "";
		//$this->mysqli->query($sql);
		
		//$sql = "INSERT stock_log SET descrip='PedidosExt.method_recibir_pedido', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
		//$this->mysqli->query($sql);
		
		$sql="INSERT remito_rec_detalle SET id_remito_rec=" . $id_remito_rec . ", id_producto_item=" . $item->id_producto_item . ", cantidad=" . $item->total;
		$this->mysqli->query($sql);
		
		$sql = "INSERT pedido_ext_recibido SET id_pedido_ext = '" . $item->id_pedido_ext . "', id_producto_item = '" . $item->id_producto_item . "', sumado='" . $item->sumado . "', restado='" . $item->restado . "', cantidad = '" . $item->total . "'";
		$this->mysqli->query($sql);
	}
	
	$this->mysqli->query("COMMIT");
  }


  public function method_alta_pedido_ext($params, $error) {
  	$p = $params[0];

  	$set = $this->prepararCampos($p->model);
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	$sql = "INSERT pedido_ext SET " . $set . ", id_fabrica='" . $p->id_fabrica . "', fecha = '" . $p->fecha . "', recibido = FALSE";
	$this->mysqli->query($sql);
	$insert_id = $this->mysqli->insert_id;
	
	foreach ($p->detalle as $item) {
		if ($item->cantidad > 0) {
			$sql = "INSERT pedido_ext_detalle SET id_pedido_ext = '" . $insert_id . "', id_producto_item = '" . $item->id_producto_item . "', cantidad = '" . $item->cantidad . "'";
			$this->mysqli->query($sql);
			
			foreach ($item->detallePedInt as $item2) {
				$sql = "UPDATE pedido_suc_detalle SET id_pedido_ext='" . $insert_id . "' WHERE id_pedido_suc_detalle='" . $item2->id_pedido_suc_detalle . "'";
				$this->mysqli->query($sql);
			}
		}
	}
	
	$this->mysqli->query("COMMIT");
	
	return $insert_id;
  }

  public function method_leer_pedido($params, $error) {
	$resultado = new stdClass;
	$resultado->internos = $this->method_leer_internos($params, $error);
	$resultado->externos = $this->method_leer_externos($params, $error);
	
	return $resultado;
  }
  
  
  
  public function method_generar_pedido_faltante($params, $error) {
	$p = $params[0];
	
	$sql = "SELECT * FROM pedido_ext WHERE id_pedido_ext=" . $p->id_pedido_ext;
	$rsPE = $this->mysqli->query($sql);
	$rowPE = $rsPE->fetch_object();
	
	$p->model = $rowPE;
	
	$p->model->id_pedido_ext = 0;
	$p->model->id_remito_rec = null;
	$p->model->recibido = 0;
	$p->model->fecha_recibido = null;
	$p->model->id_pedido_ext_faltante = null;
	
	
  	$set = $this->prepararCampos($p->model, "pedido_ext");
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	$sql = "INSERT pedido_ext SET " . $set;
	$this->mysqli->query($sql);
	$insert_id = $this->mysqli->insert_id;
	
	
	$sql = "UPDATE pedido_ext SET id_pedido_ext_faltante=" . $insert_id . " WHERE id_pedido_ext=" . $p->id_pedido_ext;
	$this->mysqli->query($sql);
	
	
	foreach ($p->pedido_ext_detalle as $rowDet) {
		$sql = "INSERT pedido_ext_detalle SET id_pedido_ext = '" . $insert_id . "', id_producto_item = '" . $rowDet->id_producto_item . "', cantidad = '" . $rowDet->diferencia . "'";
		$this->mysqli->query($sql);
	}
	
	$this->mysqli->query("COMMIT");
	
	return $p->id_pedido_ext;
  }
  
  
  
  public function method_leer_internos($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(120);
  	
	$resultado = array();
	
	$sql= "SELECT" .
			" fabrica.id_fabrica" .
			", fabrica.descrip AS fabrica" .
			", producto.descrip AS producto" .
			", producto_item.id_producto_item" .
			", producto_item.capacidad" .
			", producto_item.busqueda" .
			", unidad.id_unidad" .
			", unidad.descrip AS unidad" .
			", color.descrip AS color" .
		" FROM (((producto_item INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN unidad USING(id_unidad)) INNER JOIN color USING(id_color)";

	if ($p->id_fabrica == "1") {
		$sql.= " WHERE FALSE";
	} else {
		$sql.= " WHERE producto_item.activo AND producto.id_fabrica='" . $p->id_fabrica . "'";
	}

	$sql.= " ORDER BY fabrica, producto, color, unidad, capacidad";
	
	$rsProducto_item = $this->mysqli->query($sql);
	while ($rowProducto_item = $rsProducto_item->fetch_object()) {
		/*
		$sql = "SELECT";
		$sql.= " *";
		$sql.= " FROM historico_precio";
		$sql.= " WHERE DATE(fecha)<='" . $p->fecha . "' AND id_producto_item=" . $rowProducto_item->id_producto_item;
		$sql.= " ORDER BY fecha DESC LIMIT 1";
		
		$rs = $this->mysqli->query($sql);
		
		if ($rs->num_rows == 0) {
			$sql = "SELECT";
			$sql.= "  producto.iva";
			$sql.= ", producto.desc_producto";
			$sql.= ", fabrica.desc_fabrica";
			$sql.= ", producto_item.precio_lista";
			$sql.= ", producto_item.remarc_final";
			$sql.= ", producto_item.remarc_mayorista";
			$sql.= ", producto_item.desc_final";
			$sql.= ", producto_item.desc_mayorista";
			$sql.= ", producto_item.bonif_final";
			$sql.= ", producto_item.bonif_mayorista";
			$sql.= ", producto_item.comision_vendedor";
			$sql.= " FROM (producto_item INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)";
			$sql.= " WHERE id_producto_item=" . $rowProducto_item->id_producto_item;
			
			$rs = $this->mysqli->query($sql);
		}

		$row = $rs->fetch_object();
		
		$row->iva = (float) $row->iva;
		$row->desc_producto = (float) $row->desc_producto;
		$row->desc_fabrica = (float) $row->desc_fabrica;
		$row->precio_lista = (float) $row->precio_lista;
		$row->remarc_final = (float) $row->remarc_final;
		$row->remarc_mayorista = (float) $row->remarc_mayorista;
		$row->desc_final = (float) $row->desc_final;
		$row->desc_mayorista = (float) $row->desc_mayorista;
		$row->bonif_final = (float) $row->bonif_final;
		$row->bonif_mayorista = (float) $row->bonif_mayorista;
		$row->comision_vendedor = (float) $row->comision_vendedor;
		*/
		
		
		
		
		$aux = new stdClass;
		$aux->id_producto_item = $rowProducto_item->id_producto_item;
		$aux->fecha = $p->fecha;
		$aux = array($aux);
		
		$row = $this->method_buscar_historico_precio($aux, $error);
		
		foreach ($rowProducto_item as $key => $value) {
			$row->{$key} = $value;
		}
		
		
		

		
		$this->functionCalcularImportes($row);
		

		
		
		
		//$rowPedidoSuc->seleccionado = (bool) $rowPedidoSuc->seleccionado;
		$row->capacidad = (float) $row->capacidad;
		$row->acumulado = 0;
		
		//$rowPedidoSuc->plmasiva = $rowPedidoSuc->precio_lista + ($rowPedidoSuc->precio_lista * $rowPedidoSuc->iva / 100);
		
		//$rowPedidoSuc->costo = $rowPedidoSuc->plmasiva;
		//$rowPedidoSuc->costo = $rowPedidoSuc->costo - ($rowPedidoSuc->costo * $rowPedidoSuc->desc_fabrica / 100);
		//$rowPedidoSuc->costo = $rowPedidoSuc->costo - ($rowPedidoSuc->costo * $rowPedidoSuc->desc_producto / 100);
		
		
		$row->stock = 0;
		$row->stock_suc = 0;
		$row->vendido = 0;
		$row->cantidad = 0;
		$row->detalleStock = array();
		$row->detallePedInt = $this->toJson("SELECT id_pedido_suc_detalle, descrip, cantidad FROM (pedido_suc_detalle INNER JOIN pedido_suc USING(id_pedido_suc)) INNER JOIN sucursal USING(id_sucursal) WHERE id_producto_item = '" . $row->id_producto_item . "' AND id_pedido_ext=0 ORDER BY descrip");
		foreach ($row->detallePedInt as $item) {
			$item->cantidad = (float) $item->cantidad;
			$row->acumulado = $row->acumulado + $item->cantidad;
		}
		
		
		$sql = "SELECT";
		$sql.= "  pedido_ext.fecha";
		$sql.= ", pedido_ext_detalle.cantidad";
		$sql.= " FROM pedido_ext INNER JOIN pedido_ext_detalle USING(id_pedido_ext)";
		$sql.= " WHERE NOT pedido_ext.recibido AND pedido_ext_detalle.id_producto_item=" . $row->id_producto_item;
		$sql.= " ORDER BY fecha DESC";
		
		$opciones = array("cantidad" => "int");
		$row->detallePedExt = $this->toJson($sql, $opciones);
		foreach ($row->detallePedExt as $item) {
			$item->cantidad = (float) $item->cantidad;
			$row->acumulado = $row->acumulado + $item->cantidad;
		}

		
		$sql="SELECT id_sucursal, descrip, stock FROM stock INNER JOIN sucursal USING(id_sucursal) WHERE sucursal.activo AND id_producto_item = '" . $row->id_producto_item . "' ORDER BY descrip";
		$rsStock = $this->mysqli->query($sql);
		while ($rowStock = $rsStock->fetch_object()) {
			$rowStock->stock = (float) $rowStock->stock;
			$row->detalleStock[] = $rowStock;
			if ($rowStock->id_sucursal == $this->rowParamet->id_sucursal) {
				$row->stock = $rowStock->stock;
			} else {
				$row->stock_suc = $row->stock_suc + $rowStock->stock;
			}
		}

		
		$resultado[] = $row;
	}

	return $resultado;
  }
  
    
  
  public function method_leer_externos($params, $error) {
	$p = $params[0];
	
	set_time_limit(120);
	
	$resultado = array();
  	
	
	$sql = "SELECT";
	$sql.= " pedido_ext.*, fabrica.descrip AS fabrica, transporte.descrip AS transporte, remito_rec.nro_remito";
	$sql.= " FROM ((pedido_ext INNER JOIN fabrica USING(id_fabrica)) INNER JOIN transporte USING(id_transporte)) LEFT JOIN remito_rec USING(id_remito_rec)";
	$sql.= " WHERE TRUE";
	
	if (! is_null($p->recibido)) $sql.= " AND pedido_ext.recibido=" . $p->recibido;
	if (! is_null($p->desde)) {
		$sql.= " AND DATE(pedido_ext.fecha) >= '" . substr($p->desde, 0, 10) . "'";
	}
	if (! is_null($p->hasta)) {
		$sql.= " AND DATE(pedido_ext.fecha) <= '" . substr($p->hasta, 0, 10) . "'";
	}
	if ($p->id_fabrica > "0") {
		$sql.= " AND pedido_ext.id_fabrica=" . $p->id_fabrica;
	}
	
	$sql.= " ORDER BY fecha DESC, id_pedido_ext DESC";
	
	$rsPedido_ext = $this->mysqli->query($sql);
	while ($rowPedido_ext = $rsPedido_ext->fetch_object()) {
  		$rowPedido_ext->recibido = (bool) $rowPedido_ext->recibido;
  		$rowPedido_ext->faltante = (is_null($rowPedido_ext->id_pedido_ext_faltante)) ? "" : "Generado";
  		
  		$rowPedido_ext->costo = 0;
  		$rowPedido_ext->plmasiva = 0;
  		
		
		
		$sql = "SELECT";
		$sql.= " *";
		$sql.= " FROM pedido_ext_detalle INNER JOIN producto_item USING(id_producto_item) INNER JOIN producto USING(id_producto) INNER JOIN fabrica USING(id_fabrica)";
		$sql.= " WHERE pedido_ext_detalle.id_pedido_ext=" . $rowPedido_ext->id_pedido_ext;
		
		$rsDetalle = $this->mysqli->query($sql);
		while ($rowDetalle = $rsDetalle->fetch_object()) {
			$this->functionCalcularImportes($rowDetalle);
			
  			$rowPedido_ext->costo+= $rowDetalle->costo;
  			$rowPedido_ext->plmasiva+= $rowDetalle->plmasiva;
		}

		$resultado[] = $rowPedido_ext;
	}
	
	return $resultado;
  }
  
  
  public function method_leer_externos_detalle($params, $error) {
	$p = $params[0];
  	
	$resultado = new stdClass;
	
	$sql = "SELECT pedido_ext.*, fabrica.desc_fabrica FROM pedido_ext INNER JOIN fabrica USING(id_fabrica) WHERE pedido_ext.id_pedido_ext=" . $p->id_pedido_ext;
	$rsPedido_ext = $this->mysqli->query($sql);
	$rowPedido_ext = $rsPedido_ext->fetch_object();
	$rowPedido_ext->recibido = (bool) $rowPedido_ext->recibido;
	
	$resultado->detalle = array();
	//$sql = "SELECT pedido_ext_detalle.id_pedido_ext_detalle, pedido_ext_detalle.id_pedido_ext, pedido_ext_detalle.cantidad, producto_item.*, producto.descrip AS producto, producto.iva, producto.desc_producto, color.descrip AS color, unidad.descrip AS unidad";
	$sql = "SELECT";
	$sql.= "  pedido_ext_detalle.*";
	$sql.= ", producto.descrip AS producto";
	$sql.= ", producto_item.capacidad";
	$sql.= ", unidad.id_unidad";
	$sql.= ", unidad.descrip AS unidad";
	$sql.= ", color.descrip AS color";
	$sql.= " FROM ((((pedido_ext_detalle INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE pedido_ext_detalle.id_pedido_ext=" . $p->id_pedido_ext;
	$sql.= " ORDER BY producto, color, unidad, capacidad";
	
	$rsProducto_item = $this->mysqli->query($sql);
	while ($rowProducto_item = $rsProducto_item->fetch_object()) {
		/*
		$sql = "SELECT";
		$sql.= " *";
		$sql.= " FROM historico_precio";
		$sql.= " WHERE DATE(fecha)<='" . $p->fecha . "' AND id_producto_item=" . $rowProducto_item->id_producto_item;
		$sql.= " ORDER BY fecha DESC LIMIT 1";
		
		$rs = $this->mysqli->query($sql);
		
		if ($rs->num_rows == 0) {
			$sql = "SELECT";
			$sql.= "  producto.iva";
			$sql.= ", producto.desc_producto";
			$sql.= ", fabrica.desc_fabrica";
			$sql.= ", producto_item.precio_lista";
			$sql.= ", producto_item.remarc_final";
			$sql.= ", producto_item.remarc_mayorista";
			$sql.= ", producto_item.desc_final";
			$sql.= ", producto_item.desc_mayorista";
			$sql.= ", producto_item.bonif_final";
			$sql.= ", producto_item.bonif_mayorista";
			$sql.= ", producto_item.comision_vendedor";
			$sql.= " FROM (producto_item INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)";
			$sql.= " WHERE id_producto_item=" . $rowProducto_item->id_producto_item;
			
			$rs = $this->mysqli->query($sql);
		}

		$row = $rs->fetch_object();
		
		$row->iva = (float) $row->iva;
		$row->desc_producto = (float) $row->desc_producto;
		$row->desc_fabrica = (float) $row->desc_fabrica;
		$row->precio_lista = (float) $row->precio_lista;
		$row->remarc_final = (float) $row->remarc_final;
		$row->remarc_mayorista = (float) $row->remarc_mayorista;
		$row->desc_final = (float) $row->desc_final;
		$row->desc_mayorista = (float) $row->desc_mayorista;
		$row->bonif_final = (float) $row->bonif_final;
		$row->bonif_mayorista = (float) $row->bonif_mayorista;
		$row->comision_vendedor = (float) $row->comision_vendedor;
		*/
		
		
		
		$aux = new stdClass;
		$aux->id_producto_item = $rowProducto_item->id_producto_item;
		$aux->fecha = $p->fecha;
		$aux = array($aux);
		
		$row = $this->method_buscar_historico_precio($aux, $error);
		
		foreach ($rowProducto_item as $key => $value) {
			$row->{$key} = $value;
		}
		
		
		$this->functionCalcularImportes($row);
		
		
		
		
		
		
		$row->cantidad = (float) $row->cantidad;
		$row->capacidad = (float) $row->capacidad;
		
		
		
		
		/*
		$row->plmasiva = $row->precio_lista + ($row->precio_lista * $row->iva / 100);
		
		$row->costo = $row->plmasiva;
		$row->costo = $row->costo - ($row->costo * $regPedido->desc_fabrica / 100);
		$row->costo = $row->costo - ($row->costo * $row->desc_producto / 100);
		*/
		
		$row->ingresar = 0;
		$row->sumado = 0;
		$row->restado = 0;
		$row->total = 0;
		$resultado->detalle[] = $row;
	}
	
	
	$resultado->recibidos = array();
	//$sql = "SELECT pedido_ext_recibido.cantidad, pedido_ext_recibido.sumado, pedido_ext_recibido.restado, producto_item.id_producto_item, producto_item.id_unidad, producto_item.precio_lista, producto.descrip AS producto, producto.iva, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad";
	$sql = "SELECT";
	$sql.= "  pedido_ext_recibido.cantidad";
	$sql.= ", pedido_ext_recibido.sumado";
	$sql.= ", pedido_ext_recibido.restado";
	$sql.= ", producto_item.id_producto_item";
	$sql.= ", producto_item.id_unidad";
	$sql.= ", producto_item.capacidad";
	$sql.= ", producto_item.precio_lista";
	$sql.= ", producto.descrip AS producto";
	$sql.= ", producto.iva";
	$sql.= ", color.descrip AS color";
	$sql.= ", unidad.descrip AS unidad";
	$sql.= " FROM ((((pedido_ext_recibido INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE pedido_ext_recibido.id_pedido_ext=" . $p->id_pedido_ext;
	$sql.= " ORDER BY producto, color, unidad, capacidad";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$row->capacidad = (float) $row->capacidad;
		$row->sumado = (float) $row->sumado;
		$row->restado = (float) $row->restado;
		$row->cantidad = (float) $row->cantidad;
		$resultado->recibidos[] = $row;
	}
	
	
	
	if ($rowPedido_ext->recibido) {
		foreach ($resultado->detalle as $itemDet) {
			
			$itemDet->estado_condicion = 0;
			
			$noencontrado = true;
			$diferencia = 0;
			
			$count = count($resultado->recibidos);
			for ($i = 0; $i < $count; $i++) {
				$itemRec = $resultado->recibidos[$i];
				
				if ($itemDet->id_producto_item == $itemRec->id_producto_item) {
					$noencontrado = false;
					if ($itemDet->cantidad > $itemRec->cantidad) $diferencia = $itemDet->cantidad - $itemRec->cantidad;
				}
			}
			
			if ($noencontrado) {
				$itemDet->estado_condicion = 1;
				$diferencia = $itemDet->cantidad;
			} else if ($diferencia > 0) $itemDet->estado_condicion = 1;
			
			$itemDet->diferencia = $diferencia;
		}
		
		foreach ($resultado->recibidos as $itemRec) {
			
			$itemRec->estado_condicion = 0;
			
			$noencontrado = true;
			$diferencia = 0;
			
			$count = count($resultado->detalle);
			for ($i = 0; $i < $count; $i++) {
				$itemDet = $resultado->detalle[$i];
				
				if ($itemRec->id_producto_item == $itemDet->id_producto_item) {
					$noencontrado = false;
					if ($itemRec->cantidad > $itemDet->cantidad) $diferencia = $itemRec->cantidad - $itemDet->cantidad;
				}
			}
			
			if ($noencontrado) {
				$itemRec->estado_condicion = 2;
				$diferencia = $itemRec->cantidad;
			} else if ($diferencia > 0) $itemRec->estado_condicion = 2;
			
			$itemRec->diferencia = $diferencia;
		}
  	}
	
	
	return $resultado;
  }
}

?>