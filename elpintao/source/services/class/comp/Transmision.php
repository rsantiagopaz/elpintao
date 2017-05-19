<?php

require_once("Base.php");

class class_Transmision extends class_Base
{
  
  
  public function method_transmitir_actualizacion_suc($params, $error) {
  	set_time_limit(0);
  	$resultado = array();
  	
  	$id_sucursal1 = $this->rowParamet->id_sucursal;
  	
	mysql_close($this->link1);
	$link1 = @mysql_connect($this->arraySucursal[$id_sucursal1]->url, $this->arraySucursal[$id_sucursal1]->username, $this->arraySucursal[$id_sucursal1]->password, true);
	
	//mysql_query("INSERT errores SET descrip='" . $php_errormsg . "'", $this->link1);
	
	if ($link1) {
		mysql_select_db($this->arraySucursal[$id_sucursal1]->base, $link1);
		$this->sql_query("SET NAMES 'utf8'", $link1);
		
		foreach ($this->arraySucursal as $sucursal) {
			$id_sucursal2 = $sucursal->id_sucursal;
			$resultado[$id_sucursal2] = array();
	
			$sql = "SELECT GET_LOCK('" . "actualizacion_suc_" . $id_sucursal2 . "', 5)";
			$rs = $this->sql_query($sql, $link1);
			$row = mysql_fetch_row($rs);
			if ($row[0] == "1") {
				$sql="SELECT * FROM actualizacion_suc WHERE id_sucursal=" . $id_sucursal2 . " ORDER BY id_actualizacion_suc LIMIT 1000";
				$rs = $this->sql_query($sql, $link1);
				if (mysql_num_rows($rs) > 0) {
					$link2 = @mysql_connect($sucursal->url, $sucursal->username, $sucursal->password, true);
					if ($link2) {
						try {
							mysql_select_db($sucursal->base, $link2);
							$this->sql_query("SET NAMES 'utf8'", $link2);
							
							$time = time();
							$gtrid1 = "gtrid1-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
							$gtrid2 = "gtrid2-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
							
							$this->sql_query("XA START '" . $gtrid1 . "'", $link1);
							$this->sql_query("XA START '" . $gtrid2 . "'", $link2);
			
			
							
							while ($row = mysql_fetch_object($rs)) {
								$sql=$row->sql_texto;
								$this->sql_query($sql, $link2);
								
								$sql="DELETE FROM actualizacion_suc WHERE id_actualizacion_suc=" . $row->id_actualizacion_suc . "";
								$this->sql_query($sql, $link1);
							}
							
		
							
							$this->sql_query("XA END '" . $gtrid1 . "'", $link1);
							$this->sql_query("XA END '" . $gtrid2 . "'", $link2);
							
							$this->sql_query("XA PREPARE '" . $gtrid1 . "'", $link1);
							$this->sql_query("XA PREPARE '" . $gtrid2 . "'", $link2);
							
							
							$bool1 = false;
							$rsXARecover = $this->sql_query("XA RECOVER", $link1);
							while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
								if ($rowXARecover->data==$gtrid1) {
									$bool1 = true;
									break;
								}
							}
							
							$bool2 = false;
							$rsXARecover = $this->sql_query("XA RECOVER", $link2);
							while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
								if ($rowXARecover->data==$gtrid2) {
									$bool2 = true;
									break;
								}
							}
							
							if ($bool1 && $bool2) {
								$this->sql_query("XA COMMIT '" . $gtrid2 . "'", $link2);
								$this->sql_query("XA COMMIT '" . $gtrid1 . "'", $link1);
							} else {
								$this->sql_query("XA ROLLBACK '" . $gtrid2 . "'", $link2);
								$this->sql_query("XA ROLLBACK '" . $gtrid1 . "'", $link1);
							}
						} catch (Exception $e) {
							$aux = new stdClass;
							$aux->tipo = "actualizacion";
							$aux->hora = date("H:i:s");
							$aux->descrip = "transferencia";
							$aux->detalle = $e->getMessage();
							
							$resultado[$id_sucursal2][] = $aux;
			
							//if ($boolSucursal) $this->sql_query("XA ROLLBACK '" . $gtrid2 . "'", $link2);
							//$this->sql_query("XA ROLLBACK '" . $gtrid1 . "'", $link1);
						}
					} else {
						$aux = new stdClass;
						$aux->tipo = "actualizacion";
						$aux->hora = date("H:i:s");
						$aux->descrip = "conexión remota";
						$aux->detalle = $php_errormsg;
	
						$resultado[$id_sucursal2][] = $aux;
					}
				}
				
				$sql = "SELECT RELEASE_LOCK('" . "actualizacion_suc_" . $id_sucursal2 . "')";
				$rs = $this->sql_query($sql, $link1);
			} else {
				$aux = new stdClass;
				$aux->tipo = "actualizacion";
				$aux->hora = date("H:i:s");
				$aux->descrip = "comunicación ocupada";
				$aux->detalle = $sucursal->descrip;
	
				$resultado[$id_sucursal2][] = $aux;
			}
		}
	} else {
		$aux = new stdClass;
		$aux->tipo = "actualizacion";
		$aux->hora = date("H:i:s");
		$aux->descrip = "conexión local";
		$aux->detalle = $php_errormsg;

		$resultado[$id_sucursal1] = array($aux);
	}
	
	return $resultado;
  }
  
  
  public function method_transmitir_stock($params, $error) {
  	set_time_limit(0);
  	$resultado = array();
  	
	if ($this->rowParamet->id_sucursal != $this->rowParamet->id_sucursal_deposito) {
		$link1 = $this->link1;
		$id_sucursal1 = $this->rowParamet->id_sucursal;
		$resultado[$id_sucursal1] = array();
		$sql="SELECT id_producto_item, stock FROM stock WHERE id_sucursal=" . $id_sucursal1 . " AND transmitir";
		$rs = $this->sql_query($sql, $link1);
		if (mysql_num_rows($rs) > 0) {
			//$sql="SELECT * FROM sucursal WHERE id_sucursal='" . $this->rowParamet->id_sucursal_deposito . "'";
			//$rsSucursal = $this->sql_query($sql, $link1);
			//$rowSucursal = mysql_fetch_object($rsSucursal);
			$id_sucursal2 = $this->rowParamet->id_sucursal_deposito;
			$resultado[$id_sucursal2] = array();
			
			$link2 = @mysql_connect($this->arraySucursal[$id_sucursal2]->url, $this->arraySucursal[$id_sucursal2]->username, $this->arraySucursal[$id_sucursal2]->password, true);
			if ($link2) {
				try {
					mysql_select_db($this->arraySucursal[$id_sucursal2]->base, $link2);
					$this->sql_query("SET NAMES 'utf8'", $link2);
					
					$time = time();
					$gtrid1 = "gtrid1-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
					$gtrid2 = "gtrid2-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
					
					$this->sql_query("XA START '" . $gtrid1 . "'", $link1);
					$this->sql_query("XA START '" . $gtrid2 . "'", $link2);
				
					while ($row = mysql_fetch_object($rs)) {
						$sql="UPDATE stock SET stock = '" . $row->stock . "' WHERE id_sucursal='" . $id_sucursal1 . "' AND id_producto_item='" . $row->id_producto_item . "'";
						$this->sql_query($sql, $link2);
						
						$sql="UPDATE stock SET transmitir = FALSE WHERE id_producto_item='" . $row->id_producto_item . "'";
						$this->sql_query($sql, $link1);
					}
					
					$this->sql_query("XA END '" . $gtrid1 . "'", $link1);
					$this->sql_query("XA END '" . $gtrid2 . "'", $link2);
					
					$this->sql_query("XA PREPARE '" . $gtrid1 . "'", $link1);
					$this->sql_query("XA PREPARE '" . $gtrid2 . "'", $link2);
					
					
					$bool1 = false;
					$rsXARecover = $this->sql_query("XA RECOVER", $link1);
					while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
						if ($rowXARecover->data==$gtrid1) {
							$bool1 = true;
							break;
						}
					}
					
					$bool2 = false;
					$rsXARecover = $this->sql_query("XA RECOVER", $link2);
					while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
						if ($rowXARecover->data==$gtrid2) {
							$bool2 = true;
							break;
						}
					}
					
					if ($bool1 && $bool2) {
						$this->sql_query("XA COMMIT '" . $gtrid1 . "'", $link1);
						$this->sql_query("XA COMMIT '" . $gtrid2 . "'", $link2);
					}
				} catch (Exception $e) {
					$aux = new stdClass;
					$aux->tipo = "stock";
					$aux->hora = date("H:i:s");
					$aux->descrip = "transmisión stock";
					$aux->detalle = $e->getMessage();
					
					$resultado[$id_sucursal1][] = $aux;
				}
			} else {
				$aux = new stdClass;
				$aux->tipo = "stock";
				$aux->hora = date("H:i:s");
				$aux->descrip = "conexión remota";
				$aux->detalle = $php_errormsg;

				$resultado[$id_sucursal2][] = $aux;
			}
		}
	}

	return $resultado;
  }
}

?>