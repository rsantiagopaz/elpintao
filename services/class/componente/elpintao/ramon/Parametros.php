<?php

require_once("Base_elpintao.php");

class class_Parametros extends class_Base_elpintao
{
  
  
  public function method_escribir_sucursales($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT sucursal SET id_sucursal=" . $insert_id . ", descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT sucursal SET id_sucursal=" . $insert_id . ", descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "'";
			$this->transmitir($sql);
			
			$sql="SELECT id_producto_item FROM producto_item";
			$rs = mysql_query($sql);
			while ($row = mysql_fetch_object($rs)) {
				$sql="INSERT stock SET id_producto_item='" . $row->id_producto_item . "', id_sucursal='" . $insert_id . "', stock=0";
				mysql_query($sql);
			}
		}
		
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE sucursal SET descrip='" . $item->descrip . "', url='" . $item->url . "', username='" . $item->username . "', password='" . $item->password . "' WHERE id_sucursal='" . $item->id_sucursal . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");

	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }
  


  public function method_escribir_transporte($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT transporte SET id_transporte=" . $insert_id . ", descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT transporte SET id_transporte=" . $insert_id . ", descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE transporte SET descrip='" . $item->descrip . "', domicilio='" . $item->domicilio . "', telefono='" . $item->telefono . "', email='" . $item->email . "', repone='" . $item->repone . "' WHERE id_transporte='" . $item->id_transporte . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
		
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }
  
  
  public function method_escribir_unidad($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT unidad SET id_unidad=" . $insert_id . ", descrip='" . $item->descrip . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT unidad SET id_unidad=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE unidad SET descrip='" . $item->descrip . "' WHERE id_unidad='" . $item->id_unidad . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
	
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }


  public function method_escribir_moneda($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT moneda SET id_moneda=" . $insert_id . ", descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT moneda SET id_moneda=" . $insert_id . ", descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE moneda SET descrip='" . $item->descrip . "', simbolo='" . $item->simbolo . "', cotizacion='" . $item->cotizacion . "' WHERE id_moneda='" . $item->id_moneda . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
	
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }
  
  
  public function method_escribir_usuario($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
  	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT usuario SET id_usuario=" . $insert_id . ", nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT usuario SET id_usuario=" . $insert_id . ", nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			if ($item->password == "") {
				$sql="UPDATE usuario SET nick='" . $item->nick . "', nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "' WHERE id_usuario='" . $item->id_usuario . "'";
			} else {
				$sql="UPDATE usuario SET nick='" . $item->nick . "', password=MD5('" . $item->password . "'), nro_vendedor='" . $item->nro_vendedor . "', tipo='" . $item->tipo . "' WHERE id_usuario='" . $item->id_usuario . "'";
			}
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
	
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }
  

  public function method_escribir_color($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$sql="SELECT id_color FROM color WHERE descrip LIKE '" . $item->descrip . "'";
			$rs = mysql_query($sql);
			if (mysql_num_rows($rs) > 0) {
				$row = mysql_fetch_object($rs);
				mysql_query("ROLLBACK");
				return $row->id_color;
			}
			
			
			$insert_id = "0";
			$sql="INSERT color SET id_color=" . $insert_id . ", descrip='" . $item->descrip . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT color SET id_color=" . $insert_id . ", descrip='" . $item->descrip . "'";
			$this->transmitir($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="SELECT id_color FROM color WHERE descrip LIKE '" . $item->descrip . "' AND id_color <> " . $item->id_color;
			$rs = mysql_query($sql);
			if (mysql_num_rows($rs) > 0) {
				$row = mysql_fetch_object($rs);
				mysql_query("ROLLBACK");
				return $row->id_color;
			}
			
			$sql="UPDATE color SET descrip='" . $item->descrip . "' WHERE id_color='" . $item->id_color . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
	
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }


  public function method_escribir_fabrica($params, $error) {
  	$p = $params[0];
  	
  	$cambios = $p->cambios;
  	
	try {
		mysql_query("START TRANSACTION");
		
		foreach ($cambios->altas as $item) {
			$insert_id = "0";
			$sql="INSERT fabrica SET id_fabrica=" . $insert_id . ", descrip='" . $item->descrip . "', desc_fabrica='" . $item->desc_fabrica . "'";
			mysql_query($sql);
			$insert_id = mysql_insert_id();
			$sql="INSERT fabrica SET id_fabrica=" . $insert_id . ", descrip='" . $item->descrip . "', desc_fabrica='" . $item->desc_fabrica . "'";
			$this->transmitir($sql);
			
			$sql="INSERT usuario_fabrica SELECT id_usuario, '" . $insert_id . "' AS id_fabrica FROM usuario";
			mysql_query($sql);
		}
	
		foreach ($cambios->modificados as $item) {
			$sql="UPDATE fabrica SET descrip='" . $item->descrip . "', desc_fabrica='" . $item->desc_fabrica . "' WHERE id_fabrica='" . $item->id_fabrica . "'";
			mysql_query($sql);
			$this->transmitir($sql);
		}	
	
		mysql_query("COMMIT");
	
	} catch (Exception $e) {
		mysql_query("ROLLBACK");
	}
  }
}

?>