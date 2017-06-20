<?php

require_once("Base.php");

class class_Transmision_SA extends class_Base
{
  
  
  public function method_transmitir($params, $error) {
  	set_time_limit(0);
  	
	$sql = "DELETE FROM transmision_error WHERE tipo='actualizacion'";
	mysql_query($sql, $this->link1);
	
	$id_transmision = "NULL";
	$id_sucursal1 = $this->rowParamet->id_sucursal;
  	
	foreach ($this->arraySucursal as $sucursal) {
		$link1 = @mysql_connect($this->arraySucursal[$id_sucursal1]->url, $this->arraySucursal[$id_sucursal1]->username, $this->arraySucursal[$id_sucursal1]->password, true);
		if ($link1) {
			mysql_select_db($this->arraySucursal[$id_sucursal1]->base, $link1);
			$this->sql_query("SET NAMES 'utf8'", $link1);
			
			$id_sucursal2 = $sucursal->id_sucursal;
			
			$sql = "SELECT GET_LOCK('" . "transmision_" . $id_sucursal2 . "', 5)";
			$rs = $this->sql_query($sql, $link1);
			$row = mysql_fetch_row($rs);
			if ($row[0] == "1") {
				$sql = "SELECT * FROM transmision WHERE id_sucursal=" . $id_sucursal2 . " ORDER BY id_transmision";
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
							
							$sql = "XA START '" . $gtrid1 . "'";
							$this->sql_query($sql, $link1);
							$sql = "XA START '" . $gtrid2 . "'";
							$this->sql_query($sql, $link2);
			
			
							
							while ($row = mysql_fetch_object($rs)) {
								$id_transmision = $row->id_transmision;
								$sql = $row->sql_texto;
								$this->sql_query($sql, $link2);
								
								$sql = "DELETE FROM transmision WHERE id_transmision=" . $row->id_transmision . "";
								$this->sql_query($sql, $link1);
								$id_transmision = "NULL";
							}
							
		
							
							$sql = "XA END '" . $gtrid1 . "'";
							$this->sql_query($sql, $link1);
							$sql = "XA END '" . $gtrid2 . "'";
							$this->sql_query($sql, $link2);
							
							$sql = "XA PREPARE '" . $gtrid1 . "'";
							$this->sql_query($sql, $link1);
							$sql = "XA PREPARE '" . $gtrid2 . "'";
							$this->sql_query($sql, $link2);
							
							
							$bool1 = false;
							$sql = "XA RECOVER";
							$rsXARecover = $this->sql_query($sql, $link1);
							while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
								if ($rowXARecover->data==$gtrid1) {
									$bool1 = true;
									break;
								}
							}
							
							$bool2 = false;
							$sql = "XA RECOVER";
							$rsXARecover = $this->sql_query($sql, $link2);
							while ($rowXARecover = mysql_fetch_object($rsXARecover)) {
								if ($rowXARecover->data==$gtrid2) {
									$bool2 = true;
									break;
								}
							}
							
							if ($bool1 && $bool2) {
								$sql = "XA COMMIT '" . $gtrid2 . "'";
								$this->sql_query($sql, $link2);
								$sql = "XA COMMIT '" . $gtrid1 . "'";
								$this->sql_query($sql, $link1);
							} else {
								$sql = "XA ROLLBACK '" . $gtrid2 . "'";
								$this->sql_query($sql, $link2);
								$sql = "XA ROLLBACK '" . $gtrid1 . "'";
								$this->sql_query($sql, $link1);
							}
						} catch (Exception $e) {
							$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='transferencia', detalle='" . mysql_real_escape_string($e->getMessage() . " | " . $sql, $this->link1) . "', id_transmision=" . $id_transmision;
							mysql_query($sql, $this->link1);
						}
						
						@mysql_close($link2);
						
					} else {
						$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión remota', detalle='" . mysql_real_escape_string($php_errormsg, $this->link1) . "'";
						mysql_query($sql, $this->link1);
					}
				}
				
				$sql = "SELECT RELEASE_LOCK('" . "transmision_" . $id_sucursal2 . "')";
				$rs = $this->sql_query($sql, $link1);
			} else {
				$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='comunicación ocupada', detalle='" . mysql_real_escape_string($sucursal->descrip, $this->link1) . "'";
				mysql_query($sql, $this->link1);
			}
			
			@mysql_close($link1);

		} else {
			$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal1 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión local', detalle='" . mysql_real_escape_string($php_errormsg, $this->link1) . "'";
			mysql_query($sql, $this->link1);
		}
	}
  }
  
  
  public function method_transmitir_stock($params, $error) {
  	set_time_limit(0);
  	
  	$id_sucursal = $this->rowParamet->id_sucursal;
  	
	$sql = "SELECT id_producto_item, stock FROM stock WHERE id_sucursal=" . $id_sucursal . " AND transmitir";
	$rs = $this->sql_query($sql, $this->link1);
	if (mysql_num_rows($rs) > 0) {
		mysql_query("START TRANSACTION");

		while ($row = mysql_fetch_object($rs)) {
			foreach ($this->arrayDeposito as $deposito) {
				if ($deposito->id_sucursal != $id_sucursal) {
					$sql="UPDATE stock SET stock = '" . $row->stock . "' WHERE id_sucursal='" . $id_sucursal . "' AND id_producto_item='" . $row->id_producto_item . "'";
					$this->transmitir($sql, $deposito->id_sucursal, "Transmisión stock");
					
					$sql="UPDATE stock SET transmitir = FALSE WHERE id_sucursal=" . $id_sucursal . " AND id_producto_item='" . $row->id_producto_item . "'";
					$this->sql_query($sql, $this->link1);
				}
			}
		}
		
		mysql_query("COMMIT");
	}  	
  }
  
  
  
  public function method_leer_transmision_error($params, $error) {
  	$resultado = array();
  	
  	foreach ($this->arraySucursal as $sucursal) {
  		$resultado[$sucursal->id_sucursal] = array();
  	}
  	
	$sql = "SELECT * FROM transmision_error ORDER BY id_transmision_error";
	$rs = mysql_query($sql);
	while ($row = mysql_fetch_object($rs)) {
		$resultado[$row->id_sucursal][] = $row;
	}
  	
  	return $resultado;
  }
  
  
  public function method_transmitir_especial($params, $error) {
  	set_time_limit(0);
  	
	$sql = "DELETE FROM transmision_error WHERE tipo='actualizacion'";
	mysql_query($sql, $this->link1);
  	
  	$id_sucursal1 = $this->rowParamet->id_sucursal_deposito;
  	
	$link1 = @mysql_connect($this->arraySucursal[$id_sucursal1]->url, $this->arraySucursal[$id_sucursal1]->username, $this->arraySucursal[$id_sucursal1]->password, true);
	
	if ($link1) {
		mysql_select_db($this->arraySucursal[$id_sucursal1]->base, $link1);
		$this->sql_query("SET NAMES 'utf8'", $link1);
		
		foreach ($this->arraySucursal as $sucursal) {
			$id_sucursal2 = $sucursal->id_sucursal;
			if ($id_sucursal2==$this->rowParamet->id_sucursal) {
				
				$sql = "SELECT GET_LOCK('" . "transmision_" . $id_sucursal2 . "', 5)";
				$rs = $this->sql_query($sql, $link1);
				$row = mysql_fetch_row($rs);
				if ($row[0] == "1") {
					$sql="SELECT * FROM transmision WHERE id_sucursal=" . $id_sucursal2 . " ORDER BY id_transmision";
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
									
									$sql="DELETE FROM transmision WHERE id_transmision=" . $row->id_transmision . "";
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
								$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='transferencia', detalle='" . $e->getMessage() . "'";
								mysql_query($sql, $this->link1);
							}
						} else {
							$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión local', detalle='" . $php_errormsg . "'";
							mysql_query($sql, $this->link1);
						}
					}
					
					$sql = "SELECT RELEASE_LOCK('" . "transmision_" . $id_sucursal2 . "')";
					$rs = $this->sql_query($sql, $link1);
				} else {
					$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='comunicación ocupada', detalle='" . $sucursal->descrip . "'";
					mysql_query($sql, $this->link1);
				}
			}
		}
	} else {
		$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal1 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión remota', detalle='" . $php_errormsg . "'";
		mysql_query($sql, $this->link1);
	}
  }
}

?>