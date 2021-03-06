<?php

require_once("Base.php");

class class_PedidosInt extends class_Base
{


  public function method_leer_pedido($params, $error) {
	
	$sql = "SELECT pedido_int.*, sucursal.descrip AS sucursal, fabrica.descrip AS fabrica FROM (pedido_int INNER JOIN sucursal USING(id_sucursal)) INNER JOIN fabrica USING(id_fabrica) ORDER BY fecha DESC";
	return $this->toJson($sql);
	
	
  	/*
	$resultado = array();
	
	$sql="SELECT pedido_int.*, fabrica.descrip AS fabrica FROM pedido_int INNER JOIN fabrica USING(id_fabrica) ORDER BY fecha DESC";
	$rsPedido_int = $this->mysqli->query($sql);
	
	
	while ($regPedido_int = $rsPedido_int->fetch_object()) {
		$regPedido_int->detalle = array();
		$regPedido_int->remitos = array();
		$sql ="SELECT pedido_int_detalle.id_pedido_int_detalle, producto_item.id_producto_item, producto_item.id_unidad, producto_item.precio_lista, fabrica.descrip AS fabrica, producto.descrip AS producto, producto.iva, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad, pedido_int_detalle.cantidad";
		$sql.=" FROM (((((pedido_int_detalle INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
		$sql.=" WHERE pedido_int_detalle.id_pedido_int='" . $regPedido_int->id_pedido_int . "'";
		$rsDetalle = $this->mysqli->query($sql);
		while ($regDetalle = $rsDetalle->fetch_object()) {
			$regDetalle->capacidad = (float) $regDetalle->capacidad;
			$regDetalle->precio_lista = (float) $regDetalle->precio_lista;
			$regDetalle->plmasiva = $regDetalle->precio_lista + ($regDetalle->precio_lista * (float) $regDetalle->iva / 100);
			$regDetalle->cantidad = (float) $regDetalle->cantidad;
			$regPedido_int->detalle[] = $regDetalle;
		}
		
		$sql="SELECT sucursal.descrip AS sucursal, remito_rec.nro_remito, remito_rec.id_usuario_autoriza_rec, remito_rec.estado, usuario.nick AS transporta FROM ((pedido_int_remito_rec INNER JOIN sucursal USING(id_sucursal)) LEFT JOIN remito_rec USING (id_remito_rec)) LEFT JOIN usuario ON remito_rec.id_usuario_transporta=usuario.id_usuario WHERE id_pedido_int=" . $regPedido_int->id_pedido_int;
		$rsRemitos = $this->mysqli->query($sql);
		while ($rowRemitos = $rsRemitos->fetch_object()) {
			if ($rowRemitos->estado == "A") {
				$sql="SELECT nick FROM usuario WHERE id_usuario=" . $rowRemitos->id_usuario_autoriza_rec;
				$rsAutoriza = $this->mysqli->query($sql);
				$rowAutoriza = $rsAutoriza->fetch_object();
				$rowRemitos->autoriza = $rowAutoriza->nick;
			}
			$regPedido_int->remitos[] = $rowRemitos;
		}
		
		$resultado[] = $regPedido_int;
	}
	return $resultado;
	*/
  }
  
  
  public function method_leer_detalle($params, $error) {
  	$p = $params[0];
  	
	$resultado = new stdClass;
	$resultado->detalle = array();
	$resultado->remitos = array();
	
	$sql = "SELECT pedido_int_detalle.id_pedido_int_detalle, producto_item.id_producto_item, producto_item.id_unidad, producto_item.precio_lista, fabrica.descrip AS fabrica, producto.descrip AS producto, producto.iva, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad, pedido_int_detalle.cantidad";
	$sql.= " FROM (((((pedido_int_detalle INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad))";
	$sql.= " WHERE pedido_int_detalle.id_pedido_int='" . $p->id_pedido_int . "'";
	$rsDetalle = $this->mysqli->query($sql);
	while ($regDetalle = $rsDetalle->fetch_object()) {
		$regDetalle->capacidad = (float) $regDetalle->capacidad;
		$regDetalle->precio_lista = (float) $regDetalle->precio_lista;
		$regDetalle->plmasiva = $regDetalle->precio_lista + ($regDetalle->precio_lista * (float) $regDetalle->iva / 100);
		$regDetalle->cantidad = (float) $regDetalle->cantidad;
		$resultado->detalle[] = $regDetalle;
	}
	
	$sql = "SELECT sucursal.descrip AS sucursal, remito_rec.nro_remito, remito_rec.id_usuario_autoriza_rec, remito_rec.estado, usuario.nick AS transporta FROM ((pedido_int_remito_rec INNER JOIN sucursal USING(id_sucursal)) LEFT JOIN remito_rec USING (id_remito_rec)) LEFT JOIN usuario ON remito_rec.id_usuario_transporta=usuario.id_usuario WHERE id_pedido_int=" . $p->id_pedido_int;
	$rsRemitos = $this->mysqli->query($sql);
	while ($rowRemitos = $rsRemitos->fetch_object()) {
		if ($rowRemitos->estado == "A") {
			$sql="SELECT nick FROM usuario WHERE id_usuario=" . $rowRemitos->id_usuario_autoriza_rec;
			$rsAutoriza = $this->mysqli->query($sql);
			$rowAutoriza = $rsAutoriza->fetch_object();
			$rowRemitos->autoriza = $rowAutoriza->nick;
		}
		$resultado->remitos[] = $rowRemitos;
	}

	return $resultado;
  }
  
  
  public function method_alta_pedido($params, $error) {
  	$p = $params[0];
  	
	$this->mysqli->query("START TRANSACTION");
	
	$fecha = date("Y-m-d H:i:s");
	$sql = "INSERT pedido_int SET id_sucursal='" . $p->id_sucursal . "', id_fabrica='" . $p->id_fabrica . "', fecha='" . $fecha . "', estado='E'";
	$this->mysqli->query($sql);
	$insert_id = $this->mysqli->insert_id;
	
	$sql = "INSERT pedido_suc SET id_sucursal='" . $this->rowParamet->id_sucursal . "', id_pedido_int='" . $insert_id . "', id_fabrica = '" . $p->id_fabrica . "', fecha = '" . $fecha . "', estado='C'";
	$this->transmitir($sql, $p->id_sucursal);
	$sql = "SET @id_pedido_suc = LAST_INSERT_ID()";
	$this->transmitir($sql, $p->id_sucursal);

	foreach ($p->detalle as $item) {
		$sql = "INSERT pedido_int_detalle SET id_pedido_int='" . $insert_id . "', id_producto_item='" . $item->id_producto_item . "', cantidad = '" . $item->cantidad . "'";
		$this->mysqli->query($sql);
		
		$sql = "INSERT pedido_suc_detalle SET id_pedido_suc=@id_pedido_suc, id_pedido_ext=0, id_producto_item='" . $item->id_producto_item . "', cantidad='" . $item->cantidad . "'";
		$this->transmitir($sql, $p->id_sucursal);
	}
	
	if ($this->mysqli->errno) {
		return $this->mysqli->error;
		$this->mysqli->query("ROLLBACK");
	} else {
		$this->mysqli->query("COMMIT");
		
		return $this->method_leer_pedido($params, $error);
	}
  }
}

?>