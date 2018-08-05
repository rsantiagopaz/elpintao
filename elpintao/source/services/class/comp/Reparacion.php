<?php

require_once("Base.php");

class class_Reparacion extends class_Base
{
  
  
  public function method_arreglar_stock($params, $error) {
  	set_time_limit(0);

	$resultado = array();
	
  	$sucursal = $this->arraySucursal;
  	$deposito = $this->arrayDeposito;
  	
	$sql = "SELECT id_producto_item FROM producto_item ORDER BY id_producto_item";
	$rsProducto_item = $this->mysqli->query($sql);
	
	$this->mysqli->query("START TRANSACTION");
	
	while ($rowProducto_item = $rsProducto_item->fetch_object()) {
		foreach ($sucursal as $rowSucursal) {
			if ($rowSucursal->id_sucursal == $this->rowParamet->id_sucursal || isset($deposito[$this->rowParamet->id_sucursal])) {
				$sql = "SELECT * FROM stock WHERE id_producto_item=" . $rowProducto_item->id_producto_item . " AND id_sucursal=" . $rowSucursal->id_sucursal;
				$rs = $this->mysqli->query($sql);
				
				if ($rs->num_rows == 0) {
					$sql = "INSERT stock SET id_producto_item=" . $rowProducto_item->id_producto_item . ", id_sucursal=" . $rowSucursal->id_sucursal . ", stock=0, transmitir=FALSE";
					$this->mysqli->query($sql);
					
					$aux = new stdClass;
					$aux->id_sucursal = $rowSucursal->id_sucursal;
					$aux->id_producto_item = $rowProducto_item->id_producto_item;
					$resultado[] = $aux;
				}
			}
		}
	}
	
	$this->mysqli->query("COMMIT");
	
	return $resultado;
  }
  
  
  public function method_arreglar_cuentas($params, $error) {
  	set_time_limit(0);

  	$sucursal = $this->toJson("SELECT id_sucursal FROM sucursal ORDER BY id_sucursal");
  	$cuenta = $this->toJson("SELECT id_cuenta FROM cuenta ORDER BY id_cuenta");
  	$tipo_gasto = $this->toJson("SELECT id_tipo_gasto FROM tipo_gasto ORDER BY id_tipo_gasto");
  	
  	$this->mysqli->query("START TRANSACTION");
  	
  	foreach ($sucursal as $rowSucursal) {
  		foreach ($cuenta as $rowCuenta) {
			$sql = "SELECT id_sucursal_cuenta FROM sucursal_cuenta WHERE id_sucursal=" . $rowSucursal->id_sucursal . " AND id_cuenta=" . $rowCuenta->id_cuenta;
			$rs = $this->mysqli->query($sql);
			if ($rs->num_rows == 0) {
				$insert_id = 0;
				$sql = "INSERT sucursal_cuenta SET id_sucursal_cuenta=" . $insert_id . ", id_sucursal=" . $rowSucursal->id_sucursal . ", id_cuenta=" . $rowCuenta->id_cuenta . ", marcado=FALSE";
				$this->mysqli->query($sql);
				$insert_id = $this->mysqli->insert_id;
				$sql = "INSERT sucursal_cuenta SET id_sucursal_cuenta=" . $insert_id . ", id_sucursal=" . $rowSucursal->id_sucursal . ", id_cuenta=" . $rowCuenta->id_cuenta . ", marcado=FALSE";
				$this->transmitir($sql);
			}
  		}
  	}
  	
  	foreach ($sucursal as $rowSucursal) {
  		foreach ($cuenta as $rowCuenta) {
  			foreach ($tipo_gasto as $rowTipo_gasto) {
  				if ($rowTipo_gasto->id_tipo_gasto!="1") {
					$sql = "SELECT id_cuenta_tipo_gasto FROM cuenta_tipo_gasto WHERE id_sucursal=" . $rowSucursal->id_sucursal . " AND id_cuenta=" . $rowCuenta->id_cuenta . " AND id_tipo_gasto=" . $rowTipo_gasto->id_tipo_gasto;
					$rs = $this->mysqli->query($sql);
					if ($rs->num_rows == 0) {
  						$insert_id = 0;
						$sql = "INSERT cuenta_tipo_gasto SET id_cuenta_tipo_gasto=" . $insert_id . ", id_sucursal=" . $rowSucursal->id_sucursal . ", id_cuenta=" . $rowCuenta->id_cuenta . ", id_tipo_gasto=" . $rowTipo_gasto->id_tipo_gasto . ", marcado=FALSE, importe=0";
						$this->mysqli->query($sql);
						$insert_id = $this->mysqli->insert_id;
						$sql = "INSERT cuenta_tipo_gasto SET id_cuenta_tipo_gasto=" . $insert_id . ", id_sucursal=" . $rowSucursal->id_sucursal . ", id_cuenta=" . $rowCuenta->id_cuenta . ", id_tipo_gasto=" . $rowTipo_gasto->id_tipo_gasto . ", marcado=FALSE, importe=0";
						$this->transmitir($sql);
  					}
  				}
  			}
  		}
  	}
  	
  	$this->mysqli->query("COMMIT");
  }


  public function method_arreglar_arbol($params, $error) {
  	set_time_limit(0);
  	
	$sql="SELECT id_arbol, cant_hijos, cant_productos FROM arbol ORDER BY id_arbol";
	$rsArbol = $this->mysqli->query($sql);
	while ($row = $rsArbol->fetch_object()) {
		$row->cant_hijos = (float) $row->cant_hijos;
		$row->cant_productos = (float) $row->cant_productos;
		$sql="SELECT id_arbol FROM arbol WHERE id_padre=" . $row->id_arbol;
		$rs = $this->mysqli->query($sql);
		$cant_hijos = $rs->num_rows;
		
		$sql="SELECT id_arbol FROM producto WHERE producto.activo AND id_arbol=" . $row->id_arbol;
		$rs = $this->mysqli->query($sql);
		$cant_productos = $rs->num_rows;

		if ($row->cant_hijos != $cant_hijos || $row->cant_productos != $cant_productos) {
			$this->mysqli->query("START TRANSACTION");
			
			$sql="UPDATE arbol SET cant_hijos=" . $cant_hijos . ", cant_productos=" . $cant_productos . " WHERE id_arbol=" . $row->id_arbol;
			$this->mysqli->query($sql);
			$this->transmitir($sql);
			
			$this->mysqli->query("COMMIT");
		}
	}
  }
  
  
  public function method_arreglar_campo_busqueda($params, $error) {
  	set_time_limit(0);
  	
	$sql = "SELECT";
	$sql.=" producto.id_arbol, producto.descrip, fabrica.descrip AS fabrica, producto_item.id_producto_item, producto_item.busqueda, color.descrip AS color";
	//$sql.=" FROM (producto INNER JOIN fabrica USING(id_fabrica)) INNER JOIN (producto_item INNER JOIN color USING(id_color)) USING(id_producto)";
	$sql.=" FROM ((producto INNER JOIN fabrica USING(id_fabrica)) INNER JOIN producto_item USING (id_producto)) INNER JOIN color USING (id_color)";
	$sql.=" WHERE producto.activo AND producto_item.activo";
	//$sql.=" GROUP BY id_producto_item";
	$rs = $this->mysqli->query($sql);
	
	$contador = 0;
	while ($row = $rs->fetch_object()) {
		$aux = array();
		$aux[] = $this->clasificacion_arbol($row->id_arbol);
		$aux[] = $row->descrip;
		$aux[] = $row->fabrica;
		$aux[] = $row->color;
		$busqueda = stripslashes(json_encode($aux));
		
		if ($row->busqueda != $busqueda) {
			//var_dump($row->busqueda);
			//var_dump($busqueda);
			//return;
			$this->mysqli->query("START TRANSACTION");
			
			$sql = "UPDATE producto_item SET busqueda = '" . $busqueda . "' WHERE id_producto_item='" . $row->id_producto_item . "'";
			$this->mysqli->query($sql);
			
			$this->transmitir($sql);
			
			$this->mysqli->query("COMMIT");
			$contador = $contador + 1;
		}
	}
	
	return $contador . " de " . $rs->num_rows;
  }
  
  
  public function clasificacion_arbol($id_arbol) {
  	static $clasificacion = array();
  	
  	if ($id_arbol == "1") {
  		$resultado = "";
  	} else if (is_null($clasificacion[$id_arbol])) {
		$sql = "SELECT descrip, id_padre FROM arbol WHERE id_arbol=" . $id_arbol;
		$rs = $this->mysqli->query($sql);
		$row = $rs->fetch_object();
		$resultado = $this->clasificacion_arbol($row->id_padre) . " / " . $row->descrip;
		$clasificacion[$id_arbol] = $resultado;
  	} else {
  		$resultado = $clasificacion[$id_arbol];
  	}
  	
  	return $resultado;
  }
  

  public function method_autocompletarSucursal($params, $error) {
  	$p = $params[0];
  	
	$sql = "SELECT descrip AS label, id_sucursal AS model FROM sucursal WHERE activo AND descrip LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }
  
  
  public function method_autocompletarFabrica($params, $error) {
  	$p = $params[0];
  	//set_time_limit(120);
  	
	$sql = "SELECT descrip AS label, id_fabrica AS model, fabrica.* FROM fabrica WHERE descrip LIKE '%" . $p->texto . "%' ORDER BY label";
	return $this->toJson($sql);
  }
  
  
  public function method_buscar_productos($params, $error) {
  	$p = $params[0];
	$resultado = array();
	
	$sql = "SELECT producto.descrip AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad, producto_item.activo";
	$sql.= " FROM (((producto INNER JOIN producto_item USING (id_producto)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE producto_item.activo AND producto.id_fabrica=" . $p->id_fabrica;
	$sql.= " ORDER BY producto, color, unidad, capacidad";

	$rs = $this->mysqli->query($sql);
	while ($reg = $rs->fetch_object()) {
		$reg->capacidad = (float) $reg->capacidad;
		$resultado[] = $reg;
	}
	return $resultado;
  }
  
  
  public function method_unir_fabrica($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	$sql = "UPDATE producto SET id_fabrica=" . $p->id_fabrica_destino . " WHERE id_fabrica=" . $p->id_fabrica_origen;
	$this->mysqli->query($sql);
	$this->transmitir($sql);
	
	$sql = "UPDATE pedido_ext SET id_fabrica=" . $p->id_fabrica_destino . " WHERE id_fabrica=" . $p->id_fabrica_origen;
	$this->mysqli->query($sql);
	$this->transmitir($sql);
	
	$sql = "UPDATE pedido_int SET id_fabrica=" . $p->id_fabrica_destino . " WHERE id_fabrica=" . $p->id_fabrica_origen;
	$this->mysqli->query($sql);
	$this->transmitir($sql);
	
	$sql = "UPDATE pedido_suc SET id_fabrica=" . $p->id_fabrica_destino . " WHERE id_fabrica=" . $p->id_fabrica_origen;
	$this->mysqli->query($sql);
	$this->transmitir($sql);
	
	$sql = "DELETE FROM fabrica WHERE id_fabrica=" . $p->id_fabrica_origen;
	$this->mysqli->query($sql);
	$this->transmitir($sql);

	$this->mysqli->query("COMMIT");
	
	
	$this->method_arreglar_campo_busqueda($params, $error);
  }
  
  
  public function method_reparar_historico_precio($params, $error) {
  	$p = $params[0];

	set_time_limit(0);
	$contador = 0;
	
	$sql = "SELECT id_producto_item FROM histo";
	$rsHisto = $this->mysqli->query($sql);
	$rowHisto = $rsHisto->fetch_object();

	$sql = "SELECT id_producto_item FROM producto_item WHERE id_producto_item>=" . $rowHisto->id_producto_item . " ORDER BY id_producto_item";
	$rsProducto_item = $this->mysqli->query($sql);
	
	try {
		while ($rowProducto_item = $rsProducto_item->fetch_object()) {
			$row = new stdClass;
			
			$sql = "SELECT * FROM historico_precio WHERE id_producto_item=" . $rowProducto_item->id_producto_item . " ORDER BY id_historico_precio";
			$rsHistorico_precio = $this->mysqli->query($sql);
			
			//$this->mysqli->query("START TRANSACTION");
			
			while ($rowHistorico_precio = $rsHistorico_precio->fetch_object()) {
				$rowHistorico_precio->iva = (float) $rowHistorico_precio->iva;
				$rowHistorico_precio->desc_fabrica = (float) $rowHistorico_precio->desc_fabrica;
				$rowHistorico_precio->desc_producto = (float) $rowHistorico_precio->desc_producto;
				$rowHistorico_precio->precio_lista = (float) $rowHistorico_precio->precio_lista;
				$rowHistorico_precio->remarc_final = (float) $rowHistorico_precio->remarc_final;
				$rowHistorico_precio->remarc_mayorista = (float) $rowHistorico_precio->remarc_mayorista;
				$rowHistorico_precio->desc_final = (float) $rowHistorico_precio->desc_final;
				$rowHistorico_precio->desc_mayorista = (float) $rowHistorico_precio->desc_mayorista;
				$rowHistorico_precio->bonif_final = (float) $rowHistorico_precio->bonif_final;
				$rowHistorico_precio->bonif_mayorista = (float) $rowHistorico_precio->bonif_mayorista;
				$rowHistorico_precio->desc_lista = (float) $rowHistorico_precio->desc_lista;
				$rowHistorico_precio->comision_vendedor = (float) $rowHistorico_precio->comision_vendedor;
				
				$bandera = true;
				
				foreach ($rowHistorico_precio as $key => $value) {
					if ($key != "id_historico_precio" && $key != "fecha") {
						if ($row->{$key} != $value) $bandera = false;
					}
				}
				
				if ($bandera) {
					$sql = "DELETE FROM historico_precio WHERE id_historico_precio=" . $rowHistorico_precio->id_historico_precio;
					$this->mysqli->query($sql);
					
					$contador = $contador + $this->mysqli->affected_rows;
				} else {
					$row = $rowHistorico_precio;
				}
			}
			
			//$this->mysqli->query("COMMIT");
			$sql = "UPDATE histo SET id_producto_item=" . $rowProducto_item->id_producto_item . " WHERE id_histo=1";
			$this->mysqli->query($sql);
		}
	} catch (Exception $e) {
		return $contador . ", " . $rowProducto_item->id_producto_item . ", " . $rowHistorico_precio->id_historico_precio . ", " . $e->getMessage();
	}
	
	$sql = "UPDATE histo SET texto='" . $contador . ", " . date("H:i:s") . "' WHERE id_histo=1";
	$this->mysqli->query($sql);
	
	return $contador . ", " . date("H:i:s");
  }
}

?>