<?php

require_once("Base_elpintao.php");

class class_Parametros extends class_Base_elpintao
{
  
  
  public function method_escribir_sucursales($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT sucursal SET id_sucursal=" . $insert_id . ", descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT sucursal SET id_sucursal=" . $insert_id . ", descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "'";
			$this->transmitir($sql);
			
			$sql="SELECT id_producto_item FROM producto_item";
			$rs = $this->mysqli->query($sql);
			while ($row = $rs->fetch_object()) {
				$sql="INSERT stock SET id_producto_item='" . $row->id_producto_item . "', id_sucursal='" . $insert_id . "', stock=0";
				$this->mysqli->query($sql);
			}
		}
		
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE sucursal SET descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "' WHERE id_sucursal='" . $item->id_sucursal . "'";
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");

	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }
  


  public function method_escribir_transporte($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT transporte SET id_transporte=" . $insert_id . ", descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT transporte SET id_transporte=" . $insert_id . ", descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE transporte SET descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "' WHERE id_transporte='" . $item->id_transporte . "'";
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");
		
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }
  
  
  public function method_escribir_unidad($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT unidad SET id_unidad=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT unidad SET id_unidad=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE unidad SET descrip='" . $item->descrip . "' WHERE id_unidad='" . $item->id_unidad . "'";
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");
	
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }


  public function method_escribir_moneda($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT moneda SET id_moneda=" . $insert_id . ", descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT moneda SET id_moneda=" . $insert_id . ", descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE moneda SET descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "' WHERE id_moneda='" . $item->id_moneda . "'";
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");
	
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }
  
  
  public function method_escribir_usuario($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT usuario SET id_usuario=" . $insert_id . ", nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT usuario SET id_usuario=" . $insert_id . ", nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			if ($item->password == "") {
				$sql="UPDATE usuario SET nick='" . $item->nick . "', nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "' WHERE id_usuario='" . $item->id_usuario . "'";
			} else {
				$sql="UPDATE usuario SET nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "' WHERE id_usuario='" . $item->id_usuario . "'";
			}
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");
	
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }
  

  public function method_escribir_color($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		$this->mysqli->query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$sql="SELECT id_color FROM color WHERE descrip LIKE '" . $item->descrip . "'";
			$rs = $this->mysqli->query($sql);
			if ($rs->num_rows > 0) {
				$row = $rs->fetch_object();
				$this->mysqli->query("ROLLBACK");
				return $row->id_color;
			}
			
			
			$insert_id = "0";
			$sql="INSERT color SET id_color=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->mysqli->query($sql);
			$insert_id = $this->mysqli->insert_id;
			$sql="INSERT color SET id_color=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="SELECT id_color FROM color WHERE descrip LIKE '" . $item->descrip . "' AND id_color <> " . $item->id_color;
			$rs = $this->mysqli->query($sql);
			if ($rs->num_rows > 0) {
				$row = $rs->fetch_object();
				$this->mysqli->query("ROLLBACK");
				return $row->id_color;
			}
			
			$sql="UPDATE color SET descrip='" . $item->descrip . "' WHERE id_color='" . $item->id_color . "'";
			$this->mysqli->query($sql);
			$this->transmitir($sql);
		}	
	
		$this->mysqli->query("COMMIT");
	
	} catch (Exception $e) {
		$this->mysqli->query("ROLLBACK");
	}
  }

  
  
  public function method_alta_modifica_fabrica($params, $error) {
  	$p = $params[0];
  	
  	$sql = "SELECT id_fabrica FROM fabrica WHERE descrip='" . $p->model->descrip . "' AND id_fabrica <> " . $p->model->id_fabrica;
  	$rs = $this->mysqli->query($sql);
  	if ($rs->num_rows > 0) {
  		$error->SetError(0, "descrip");
  		return $error;
  	}
  	
	$id_fabrica = $p->model->id_fabrica;
	
	$set = $this->prepararCampos($p->model, "fabrica");
	
	
	$this->mysqli->query("START TRANSACTION");
		
	if ($id_fabrica == "0") {
		$sql = "INSERT fabrica SET " . $set;
		$this->mysqli->query($sql);
		
		$id_fabrica = $this->mysqli->insert_id;
		
		$p->model->id_fabrica = $id_fabrica;
		$set = $this->prepararCampos($p->model, "fabrica");
		
		$sql = "INSERT fabrica SET " . $set;
		$this->transmitir($sql);
		
		
		$sql = "INSERT usuario_fabrica SELECT id_usuario, '" . $id_fabrica . "' AS id_fabrica FROM usuario";
		$this->mysqli->query($sql);

	} else {
		$sql = "UPDATE fabrica SET " . $set . " WHERE id_fabrica=" . $id_fabrica;
		$this->mysqli->query($sql);
		$this->transmitir($sql);
	}
	
	$this->mysqli->query("COMMIT");
	
	return $id_fabrica;
  }
}

?>