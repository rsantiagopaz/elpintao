<?php

require_once("Base.php");

class class_PedidosSuc extends class_Base
{
  
  
  public function method_grabar_remitos($params, $error) {
  	$p = $params[0];
  	
  	//$fp = fopen("userinfobatch.txt", "w");
  	//fwrite($fp, json_encode($p));
  	//fclose($fp);
  	//return $p;
  	
  	$id_remito_suc = array();

  	$aux = new stdClass;
  	$aux->id_pedido_int = $p->seleccionado->id_pedido_int;
  	$json = json_encode($aux);
  	
  	$fecha = date("Y-m-d H:i:s");
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	foreach ($p->detalle as $detalle) {
		
		$sql = "INSERT log SET descrip='Pedidos de sucursal respondido', texto='" . json_encode($detalle) . "', fecha='" . $fecha . "', nick='" . $_SESSION['conexion']->login->nick . "'";
		$this->mysqli->query($sql);
		
		foreach ($detalle->stock as $stock) {
			if ($stock->enviar > 0) {
				if (is_null($id_remito_suc[$stock->id_sucursal])) {
					$sql = "INSERT remito_suc SET id_sucursal_de='" . $stock->id_sucursal . "', id_sucursal_para='" . $p->id_sucursal . "', json='" . $json . "'";
					$this->mysqli->query($sql);
					$id_remito_suc[$stock->id_sucursal] = $this->mysqli->insert_id;
					
					$sql = "INSERT remito_emi SET nro_remito='', tipo=1, id_sucursal_para='" . $p->id_sucursal . "', id_fabrica=0, fecha='" . $fecha . "', json='" . $json . "', estado='R'";
					$this->transmitir($sql, $stock->id_sucursal);
					$sql = "SET @id_remito_emi = LAST_INSERT_ID()";
					$this->transmitir($sql, $stock->id_sucursal);
					
					foreach ($p->seleccionado->id_pedido_int as $id_pedido_int) {
						$sql = "INSERT pedido_int_remito_rec SET id_pedido_int=" . $id_pedido_int . ", id_sucursal=" . $stock->id_sucursal . "";
						$this->transmitir($sql, $p->id_sucursal);
					}
				}
				 
				$sql = "INSERT remito_suc_detalle SET id_remito_suc='" . $id_remito_suc[$stock->id_sucursal] . "', id_producto_item='" . $detalle->id_producto_item . "', cantidad='" . $stock->enviar . "'";
				$this->mysqli->query($sql);
				
				$sql = "INSERT remito_emi_detalle SET id_remito_emi=@id_remito_emi, id_producto_item='" . $detalle->id_producto_item . "', cantidad='" . $stock->enviar . "'";
				$this->transmitir($sql, $stock->id_sucursal);
			}
		}
	}
	foreach ($p->seleccionado->id_pedido_suc as $id_pedido_suc) {
		$sql = "UPDATE pedido_suc SET estado='R' WHERE id_pedido_suc='" . $id_pedido_suc . "'";
		$this->mysqli->query($sql);
	}
	foreach ($p->seleccionado->id_pedido_int as $id_pedido_int) {
		$sql = "UPDATE pedido_int SET estado='R' WHERE id_pedido_int=" . $id_pedido_int;
		$this->transmitir($sql, $p->id_sucursal);
	}
	
	$this->mysqli->query("COMMIT");
  }


  public function method_leer_pedido($params, $error) {
 	$p = $params[0];
	$resultado = array();
	
	$sql="SELECT pedido_suc.*, fabrica.descrip AS fabrica FROM pedido_suc INNER JOIN fabrica USING(id_fabrica) WHERE pedido_suc.id_sucursal='" . $p->id_sucursal . "' AND pedido_suc.estado='C' ORDER BY fecha DESC";
	$rsPedido = $this->mysqli->query($sql);
	while ($regPedido = $rsPedido->fetch_object()) {
		$regPedido->seleccionado = false;
		$regPedido->detalle = array();
		
		$sql="SELECT pedido_suc_detalle.id_pedido_suc_detalle, producto_item.id_producto_item, producto_item.id_unidad, fabrica.descrip AS fabrica, producto.descrip AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad, pedido_suc_detalle.cantidad";
		$sql.=" FROM (((((pedido_suc_detalle INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
		$sql.=" WHERE pedido_suc_detalle.id_pedido_suc='" . $regPedido->id_pedido_suc . "'";
		$rsDetalle = $this->mysqli->query($sql);
		while ($rowDetalle = $rsDetalle->fetch_object()) {
			$rowDetalle->capacidad = (float) $rowDetalle->capacidad;
			$rowDetalle->cantidad = (float) $rowDetalle->cantidad;
			$rowDetalle->enviar = 0;
			$rowDetalle->adicional = false;
			$rowDetalle->stock = array();
			
			$sql="SELECT sucursal.id_sucursal, sucursal.descrip AS sucursal_descrip, stock FROM sucursal INNER JOIN stock USING(id_sucursal) WHERE sucursal.activo AND id_producto_item='" . $rowDetalle->id_producto_item . "' ORDER BY sucursal_descrip";
			$rsStock = $this->mysqli->query($sql);
			while ($rowStock = $rsStock->fetch_object()) {
				$rowStock->stock = (float) $rowStock->stock;
				
				if ($rowStock->id_sucursal == $p->id_sucursal) {
					$rowDetalle->stock_suc = $rowStock->stock;
				} else {
					if ($rowStock->id_sucursal == $this->rowParamet->id_sucursal) {
						$rowDetalle->stock_dep = $rowStock->stock;
					}
					
					$rowStock->enviar = 0;
					$rowDetalle->stock[] = $rowStock;
				}
			}
			$regPedido->detalle[] = $rowDetalle;
		}
		$resultado[] = $regPedido;
	}
	return $resultado;
  }
  
  
  public function method_anular_pedido($params, $error) {
  	$p = $params[0];
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	$sql = "UPDATE pedido_suc SET estado='A' WHERE id_pedido_suc=" . $p->id_pedido_suc;
	$this->mysqli->query($sql);
	
	$sql = "UPDATE pedido_int SET estado='A' WHERE id_pedido_int=" . $p->id_pedido_int;
	$this->transmitir($sql, $p->id_sucursal);
	
	$this->mysqli->query("COMMIT");
  }
  
  
  public function method_leer_stock($params, $error) {
  	$p = $params[0];
  	
  	$resultado = new stdClass;
  	$resultado->stock = array();
  	$resultado->stock_suc = 0;
  	$resultado->stock_dep = 0;
  	
	$sql="SELECT sucursal.id_sucursal, sucursal.descrip AS sucursal_descrip, stock FROM sucursal INNER JOIN stock USING(id_sucursal) WHERE sucursal.activo AND id_producto_item='" . $p->id_producto_item . "' ORDER BY sucursal_descrip";
	$rsStock = $this->mysqli->query($sql);
	while ($rowStock = $rsStock->fetch_object()) {
		$rowStock->stock = (float) $rowStock->stock;
		
		if ($rowStock->id_sucursal == $p->id_sucursal) {
			$resultado->stock_suc = $rowStock->stock;
		} else {
			if ($rowStock->id_sucursal == $this->rowParamet->id_sucursal) {
				$resultado->stock_dep = $rowStock->stock;
			}
					
			$rowStock->enviar = 0;
			$resultado->stock[] = $rowStock;
		}
	}
			
	return $resultado;
  }
  
  
  public function method_cargar_pi_gral($params, $error) {
	$p = $params[0];
	
	if (is_null($_SESSION["pi_gral"])) $_SESSION["pi_gral"] = array();
	
	$_SESSION["pi_gral"][$p->key] = $p->value;
  }
}

?>