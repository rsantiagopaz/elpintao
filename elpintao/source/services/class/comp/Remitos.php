<?php
require_once("Base.php");
class class_Remitos extends class_Base
{
  
  
  public function method_alta_modifica_remito_rec($params, $error) {
  	$p = $params[0];
  	
  	$resultado = $p->id_remito;
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	if ($p->id_remito == "0") {
		$sql="INSERT remito_rec SET nro_remito='" . $p->nro_remito . "', tipo=0, id_sucursal_de=" . $p->id_sucursal . ", destino='" . $p->destino . "', fecha=NOW(), id_usuario_transporta=0, estado='R'";
		$this->mysqli->query($sql);
		$resultado = $this->mysqli->insert_id;
	} else {
		$sql="UPDATE remito_rec SET nro_remito='" . $p->nro_remito . "', id_sucursal_de=" . $p->id_sucursal . ", destino='" . $p->destino . "' WHERE id_remito_rec=" . $resultado;
		$this->mysqli->query($sql);
		
		$sql="DELETE FROM remito_rec_detalle WHERE id_remito_rec=" . $resultado;
		$this->mysqli->query($sql);
	}
	foreach ($p->detalle as $item) {
		$sql="INSERT remito_rec_detalle SET id_remito_rec=" . $resultado . ", id_producto_item=" . $item->id_producto_item . ", cantidad=" . $item->cantidad;
		$this->mysqli->query($sql);
	}
	
	$this->mysqli->query("COMMIT");
	
	return $resultado;
  }
  
  
  
  public function method_alta_modifica_remito_emi($params, $error) {
  	$p = $params[0];
  	
  	$resultado = $p->id_remito;
  	
  	$this->mysqli->query("START TRANSACTION");
  	
	if ($p->id_remito == "0") {
		$sql="INSERT remito_emi SET nro_remito='', tipo=2, id_sucursal_para=" . $p->id_sucursal . ", destino='" . $p->destino . "', fecha=NOW(), json='{}', estado='R'";
		$this->mysqli->query($sql);
		$resultado = $this->mysqli->insert_id;
	} else {
		$sql="UPDATE remito_emi SET id_sucursal_para=" . $p->id_sucursal . ", destino='" . $p->destino . "' WHERE id_remito_emi=" . $resultado;
		$this->mysqli->query($sql);
		
		$sql="DELETE FROM remito_emi_detalle WHERE id_remito_emi=" . $resultado;
		$this->mysqli->query($sql);
	}
	foreach ($p->detalle as $item) {
		$sql="INSERT remito_emi_detalle SET id_remito_emi=" . $resultado . ", id_producto_item=" . $item->id_producto_item . ", cantidad=" . $item->cantidad;
		$this->mysqli->query($sql);
	}
	
	$this->mysqli->query("COMMIT");
	
	return $resultado;
  }
  
  
  public function method_autorizar_remito_rec($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = new stdClass;
  	$resultado->error = array();
  	
  	
	$sql="SELECT estado FROM remito_rec WHERE id_remito_rec=" . $p->id_remito;
	$rs = $this->mysqli->query($sql);
  	$row = $rs->fetch_object();
  	if ($row->estado == "R") {
		$sql="SELECT * FROM usuario WHERE nick='" . $p->model->autoriza . "' AND password=MD5('" . $p->model->autoriza_pass . "')";
		$rsAutoriza = $this->mysqli->query($sql);
		if ($rsAutoriza->num_rows != 1) {
			$item = new stdClass();
			$item->descrip = "autoriza";
			$item->message = " Usuario y/o contraseña incorrecta ";
			$resultado->error[] = $item;
		}
		
		if (is_null($p->model->transporta)) {
			$rowTransporta = new stdClass;
			$rowTransporta->id_usuario = "0";
		} else {
			if ($p->id_usuario_transporta=="0") {
				$sql="SELECT * FROM usuario WHERE nick='" . $p->model->transporta . "' AND password=MD5('" . $p->model->transporta_pass . "')";
			} else {
				$sql="SELECT usuario.* FROM usuario INNER JOIN remito_rec ON usuario.id_usuario=remito_rec.id_usuario_transporta WHERE remito_rec.id_remito_rec='" . $p->id_remito . "' AND usuario.nick='" . $p->model->transporta . "' AND usuario.password=MD5('" . $p->model->transporta_pass . "')";
			}
			$rsTransporta = $this->mysqli->query($sql);
			if ($rsTransporta->num_rows != 1) {
				$item = new stdClass();
				$item->descrip = "transporta";
				$item->message = " Usuario y/o contraseña incorrecta ";
				$resultado->error[] = $item;
			}  else $rowTransporta = $rsTransporta->fetch_object();
		}
		
		if (empty($resultado->error)) {
			$rowAutoriza = $rsAutoriza->fetch_object();
			
			$this->mysqli->query("START TRANSACTION");
			
			$sql = "UPDATE remito_rec SET fecha=NOW(), id_usuario_autoriza_rec='" . $rowAutoriza->id_usuario . "', id_usuario_transporta='" . $rowTransporta->id_usuario . "', estado='A' WHERE id_remito_rec=" . $p->id_remito;
			$this->mysqli->query($sql);
			
			$sql = "INSERT stock_log SET descrip='Remitos.method_autorizar_remito_rec', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
			$this->mysqli->query($sql);
			
			$detalle = $this->toJson("SELECT id_producto_item, cantidad FROM remito_rec_detalle WHERE id_remito_rec='" . $p->id_remito . "'");
			foreach ($detalle as $item) {
				$sql="UPDATE stock SET stock = stock + " . $item->cantidad . ", transmitir = TRUE WHERE id_sucursal=" . $this->rowParamet->id_sucursal . " AND id_producto_item=" . $item->id_producto_item . "";
				$this->mysqli->query($sql);
				
				$sql = "INSERT stock_log SET descrip='Remitos.method_autorizar_remito_rec', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
				$this->mysqli->query($sql);
			}
			
			$this->mysqli->query("COMMIT");
		}
  	} else {
		$item = new stdClass();
		$item->descrip = "autorizado";
		$item->message = " El remito seleccionado ya fué autorizado. ";
		$resultado->error[] = $item;
  	}
	
	return $resultado;
  }
  
  
  public function method_autorizar_remito_emi($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = new stdClass;
  	$resultado->error = array();
  	
	$sql="SELECT estado FROM remito_emi WHERE id_remito_emi=" . $p->id_remito;
	$rs = $this->mysqli->query($sql);
  	$row = $rs->fetch_object();
  	if ($row->estado == "R") {
		$sql="SELECT id_usuario FROM usuario WHERE nick='" . $p->model->autoriza . "' AND password=MD5('" . $p->model->autoriza_pass . "')";
		$rsAutoriza = $this->mysqli->query($sql);
		if ($rsAutoriza->num_rows != 1) {
			$item = new stdClass();
			$item->descrip = "autoriza";
			$item->message = " Usuario y/o contraseña incorrecta ";
			$resultado->error[] = $item;
		}
		
		if (is_null($p->model->transporta)) {
			$rowTransporta = new stdClass;
			$rowTransporta->id_usuario = "0";
		} else {
			$sql="SELECT id_usuario FROM usuario WHERE nick='" . $p->model->transporta . "' AND password=MD5('" . $p->model->transporta_pass . "')";
			$rsTransporta = $this->mysqli->query($sql);
			if ($rsTransporta->num_rows != 1) {
				$item = new stdClass();
				$item->descrip = "transporta";
				$item->message = " Usuario y/o contraseña incorrecta ";
				$resultado->error[] = $item;
			} else $rowTransporta = $rsTransporta->fetch_object();
		}
		
		//if ($rsAutoriza->num_rows == 1 && (is_null($p->model->transporta) || $rsTransporta->num_rows == 1)) {
		if (empty($resultado->error)) {
			$rowAutoriza = $rsAutoriza->fetch_object();
			
			$sql="SELECT * FROM remito_emi WHERE id_remito_emi=" . $p->id_remito;
			$rsRemito_emi = $this->mysqli->query($sql);
			$rowRemito_emi = $rsRemito_emi->fetch_object();
			
			$nro_remito = str_pad((string) $this->rowParamet->nro_sucursal, 4, "0", STR_PAD_LEFT) . "-" . str_pad((string) $this->rowParamet->nro_remito + 1, 8, "0", STR_PAD_LEFT);
			$fecha = date("Y-m-d H:i:s");
			
			$this->mysqli->query("START TRANSACTION");
			
			$sql="UPDATE remito_emi SET nro_remito='" . $nro_remito . "', fecha='" . $fecha . "', id_usuario_autoriza_emi='" . $rowAutoriza->id_usuario . "', id_usuario_transporta='" . $rowTransporta->id_usuario . "', estado='A' WHERE id_remito_emi='" . $p->id_remito . "'";
			$this->mysqli->query($sql);
			
			$sql = "INSERT stock_log SET descrip='Remitos.method_autorizar_remito_emi', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
			$this->mysqli->query($sql);
			
			if ($rowRemito_emi->id_sucursal_para != "0") {
				$sql = "INSERT remito_rec SET nro_remito='" . $nro_remito . "', tipo='" . $rowRemito_emi->tipo . "', id_sucursal_de='" . $this->rowParamet->id_sucursal . "', fecha='" . $fecha . "', id_usuario_autoriza_emi='" . $rowAutoriza->id_usuario . "', id_usuario_transporta='" . $rowTransporta->id_usuario . "', estado='R'";
				$this->transmitir($sql, $rowRemito_emi->id_sucursal_para);
				$sql = "SET @id_remito_rec = LAST_INSERT_ID()";
				$this->transmitir($sql, $rowRemito_emi->id_sucursal_para);
				
				$json = json_decode($rowRemito_emi->json);
				if (! is_null($json->id_pedido_int)) {
					foreach ($json->id_pedido_int as $id_pedido_int) {
						$sql = "UPDATE pedido_int_remito_rec SET id_remito_rec=@id_remito_rec WHERE id_pedido_int=" . $id_pedido_int . " AND id_sucursal=" . $this->rowParamet->id_sucursal . "";
						$this->transmitir($sql, $rowRemito_emi->id_sucursal_para);
					}
				}
			}
			
			
			$detalle = $this->toJson("SELECT id_producto_item, cantidad FROM remito_emi_detalle WHERE id_remito_emi='" . $p->id_remito . "'");
			foreach ($detalle as $item) {
				$sql="UPDATE stock SET stock = stock - " . $item->cantidad . ", transmitir = TRUE WHERE id_sucursal=" . $this->rowParamet->id_sucursal . " AND id_producto_item=" . $item->id_producto_item . "";
				$this->mysqli->query($sql);
				
				$sql = "INSERT stock_log SET descrip='Remitos.method_autorizar_remito_emi', sql_texto='" . $this->mysqli->real_escape_string($sql) . "', fecha=NOW()";
				$this->mysqli->query($sql);
				
				if ($rowRemito_emi->id_sucursal_para != "0") {
					$sql = "INSERT remito_rec_detalle SET id_remito_rec=@id_remito_rec, id_producto_item=" . $item->id_producto_item . ", cantidad=" . $item->cantidad . "";
					$this->transmitir($sql, $rowRemito_emi->id_sucursal_para);
				}
			}
			
			$sql="UPDATE paramet SET nro_remito=nro_remito + 1 WHERE id_paramet=1";
			$this->mysqli->query($sql);
			
			$this->mysqli->query("COMMIT");
		}
  	} else {
		$item = new stdClass();
		$item->descrip = "autorizado";
		$item->message = " El remito seleccionado ya fué autorizado. ";
		$resultado->error[] = $item;
  	}
	
	return $resultado;
  }
  
  
  public function method_leer_remitos_rec($params, $error) {
	$p = $params[0];
	
	set_time_limit(0);
  	
	$resultado = new stdClass;
	$resultado->remito = array();
  	
	$sql = "SELECT remito_rec.*, sucursal.descrip";
	$sql.= " FROM remito_rec LEFT JOIN sucursal ON remito_rec.id_sucursal_de = sucursal.id_sucursal";
	$sql.= " WHERE TRUE";
	
	if ($p->estado == "Registrado") {
		$sql.= " AND remito_rec.estado='R'";
	} else if ($p->estado == "Autorizado") {
		$sql.= " AND remito_rec.estado='A'";
	}
	
	if (! is_null($p->desde) && ! is_null($p->hasta)) {
		$sql.= " AND (DATE(remito_rec.fecha) BETWEEN '" . substr($p->desde, 0, 10) . "' AND '" . substr($p->hasta, 0, 10) . "')";
	} else if (! is_null($p->desde)) {
		$sql.= " AND DATE(remito_rec.fecha) >= '" . substr($p->desde, 0, 10) . "'";
	} else if (! is_null($p->hasta)) {
		$sql.= " AND DATE(remito_rec.fecha) <= '" . substr($p->hasta, 0, 10) . "'";
	}
	
	if ($p->id_sucursal > "0") {
		$sql.= " AND id_sucursal_de=" . $p->id_sucursal;
	}
	
	
	$sql.= " ORDER BY id_remito_rec DESC";
	
	$rsRemito = $this->mysqli->query($sql);
	while ($rowRemito = $rsRemito->fetch_object()) {
		$rowRemito->destino_descrip = ($rowRemito->id_sucursal_de != "0") ? $rowRemito->descrip : $rowRemito->destino;
		
		if (empty($rowRemito->id_usuario_autoriza_rec)) {
			$rowRemito->autoriza = "";
		} else {
			$sql= "SELECT nick FROM usuario WHERE id_usuario=" . $rowRemito->id_usuario_autoriza_rec;
			$rs = $this->mysqli->query($sql);
			$row = $rs->fetch_object();
			$rowRemito->autoriza = $row->nick;
		}
		if (empty($rowRemito->id_usuario_transporta)) {
			$rowRemito->transporta = "";
		} else {
			$sql= "SELECT nick FROM usuario WHERE id_usuario=" . $rowRemito->id_usuario_transporta;
			$rs = $this->mysqli->query($sql);
			$row = $rs->fetch_object();
			$rowRemito->transporta = $row->nick;
		}
		
		$resultado->remito[] = $rowRemito;
	}
	
	return $resultado;
  }
  
  
  
  public function method_leer_remitos_emi($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
	$resultado = new stdClass;
	$resultado->remito = array();
	$resultado->calc = array();
	$calc = new stdClass;
	$aux = new stdClass;
	$aux->descrip = "Costo";
	$aux->total = 0;
	$calc->{"costo"} = $aux;
	
	$aux = new stdClass;
	$aux->descrip = "P.lis.+IVA";
	$aux->total = 0;
	$calc->{"plmasiva"} = $aux;
  	
	$sql = "SELECT DISTINCTROW remito_emi.*, CASE WHEN id_sucursal_para<>0 THEN sucursal.descrip ELSE remito_emi.destino END AS destino_descrip, CASE remito_emi.estado WHEN 'R' THEN 'Registrado' ELSE 'Autorizado' END AS estado_descrip";
	$sql.= " FROM (((remito_emi LEFT JOIN sucursal ON remito_emi.id_sucursal_para=sucursal.id_sucursal) INNER JOIN remito_emi_detalle USING (id_remito_emi)) INNER JOIN producto_item USING (id_producto_item)) INNER JOIN producto USING (id_producto)";
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
	
	$sql.= " ORDER BY id_remito_emi DESC";
	$rsRemito = $this->mysqli->query($sql);
	while ($rowRemito = $rsRemito->fetch_object()) {
		if (empty($rowRemito->id_usuario_autoriza_emi)) {
			$rowRemito->autoriza = "";
		} else {
			$sql= "SELECT nick FROM usuario WHERE id_usuario=" . $rowRemito->id_usuario_autoriza_emi;
			$rs = $this->mysqli->query($sql);
			$row = $rs->fetch_object();
			$rowRemito->autoriza = $row->nick;
		}
		if (empty($rowRemito->id_usuario_transporta)) {
			$rowRemito->transporta = "";
		} else {
			$sql= "SELECT nick FROM usuario WHERE id_usuario=" . $rowRemito->id_usuario_transporta;
			$rs = $this->mysqli->query($sql);
			$row = $rs->fetch_object();
			$rowRemito->transporta = $row->nick;
		}
		
		//$opciones = array("cantidad"=>"float", "capacidad"=>"float");
		//$sql="SELECT remito_emi_detalle.*, fabrica.descrip AS fabrica, producto.descrip AS producto, producto_item.capacidad, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_emi_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_emi='" . $rowRemito->id_remito_emi . "'";
		//$rowRemito->detalle = $this->toJson($this->mysqli->query($sql), $opciones);
		
		$resultado->remito[] = $rowRemito;
		
		
		
		$sql = "SELECT remito_emi_detalle.*, fabrica.descrip AS fabrica, fabrica.desc_fabrica, producto.descrip AS producto, producto.*, producto_item.*, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_emi_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_emi='" . $rowRemito->id_remito_emi . "'";
		
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
			
			$calc->{"costo"}->total += $row->costo * $row->cantidad;
			$calc->{"plmasiva"}->total += $row->plmasiva * $row->cantidad;
			if (is_null($calc->{$row->id_unidad})) {
				$aux = new stdClass;
				$aux->descrip = $row->unidad;
				$aux->total = 0;
				$calc->{$row->id_unidad} = $aux;
			}
			$calc->{$row->id_unidad}->total += $row->capacidad * $row->cantidad;
		}
	}
	
	foreach ($calc as $item) {
		$resultado->calc[] = $item;
	}
	
	return $resultado;
  }
  
  
  public function method_leer_remitos_detalle($params, $error) {
  	$p = $params[0];
  	
  	set_time_limit(0);
  	
  	$resultado = array();
  	
	if ($p->emitir) {
		$sql = "SELECT remito_emi_detalle.*, fabrica.descrip AS fabrica, fabrica.desc_fabrica, producto.descrip AS producto, producto.*, producto_item.*, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_emi_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_emi='" . $p->id_remito . "'";
	} else {
		$sql = "SELECT remito_rec_detalle.*, fabrica.descrip AS fabrica, fabrica.desc_fabrica, producto.descrip AS producto, producto.*, producto_item.*, color.descrip AS color, unidad.descrip AS unidad FROM ((((remito_rec_detalle INNER JOIN producto_item USING(id_producto_item)) INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)) INNER JOIN color USING (id_color)) INNER JOIN unidad USING (id_unidad) WHERE id_remito_rec='" . $p->id_remito . "'";
	}
	
	
	
	
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$row->capacidad = (float) $row->capacidad;
		$row->cantidad = (float) $row->cantidad;
		
		/*
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
		$row->comision_vendedor = (float) $row->comision_vendedor;
		
		$this->functionCalcularImportes($row);
		*/
		
		$resultado[] = $row;
	}
	
	return $resultado;
  }
  
  
  public function method_autocompletarUsuario($params, $error) {
  	$p = $params[0];
  	set_time_limit(120);
  	
  	if (is_numeric($p->texto)) {
		$sql = "SELECT CONCAT(nro_vendedor, ' (', TRIM(nick), ')') AS label, nick AS model FROM usuario WHERE nro_vendedor LIKE '" . $p->texto . "%' ORDER BY label";
  	} else {
  		$sql = "SELECT CONCAT(TRIM(nick), ' (', nro_vendedor, ')') AS label, nick AS model FROM usuario WHERE nick LIKE '%" . $p->texto . "%' ORDER BY label";
  	}
	return $this->toJson($sql);
  }
}
?>