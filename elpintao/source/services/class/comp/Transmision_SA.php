<?php

require_once("Base.php");

class class_Transmision_SA extends class_Base
{
  
  
  public function method_transmitir($params, $error) {
  	set_time_limit(0);
  	
	$sql = "DELETE FROM transmision_error WHERE tipo='actualizacion'";
	$this->mysqli->query($sql);
	
	$id_transmision = "NULL";
	$id_sucursal1 = $this->rowParamet->id_sucursal;
  	
	foreach ($this->arraySucursal as $sucursal) {
		$mysqli_01 = @mysqli_connect($this->arraySucursal[$id_sucursal1]->url, $this->arraySucursal[$id_sucursal1]->username, $this->arraySucursal[$id_sucursal1]->password, $this->arraySucursal[$id_sucursal1]->base);
		if ($mysqli_01) {
			$mysqli_01->query("SET NAMES 'utf8'");
			
			$id_sucursal2 = $sucursal->id_sucursal;
			
			$sql = "SELECT GET_LOCK('" . "transmision_" . $id_sucursal2 . "', 5)";
			$rs = $mysqli_01->query($sql);
			$row = $rs->fetch_row();
			if ($row[0] == "1") {
				$sql = "SELECT * FROM transmision WHERE id_sucursal=" . $id_sucursal2 . " ORDER BY id_transmision";
				$rs = $mysqli_01->query($sql);
				if ($rs->num_rows > 0) {
					$mysqli_02 = @mysqli_connect($sucursal->url, $sucursal->username, $sucursal->password, $sucursal->base);
					if ($mysqli_02) {
						try {
							$mysqli_02->query("SET NAMES 'utf8'");
							
							$time = time();
							$gtrid1 = "gtrid1-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
							$gtrid2 = "gtrid2-" . $id_sucursal1 . "-" . $id_sucursal2 . "-" . $time;
							
							$sql = "XA START '" . $gtrid1 . "'";
							$mysqli_01->query($sql);
							$sql = "XA START '" . $gtrid2 . "'";
							$mysqli_02->query($sql);
			
			
							
							while ($row = $rs->fetch_object()) {
								$id_transmision = $row->id_transmision;
								$sql = $row->sql_texto;
								$mysqli_02->query($sql);
								
								$sql = "DELETE FROM transmision WHERE id_transmision=" . $row->id_transmision . "";
								$mysqli_01->query($sql);
								$id_transmision = "NULL";
							}
							
		
							
							$sql = "XA END '" . $gtrid1 . "'";
							$mysqli_01->query($sql);
							$sql = "XA END '" . $gtrid2 . "'";
							$mysqli_02->query($sql);
							
							$sql = "XA PREPARE '" . $gtrid1 . "'";
							$mysqli_01->query($sql);
							$sql = "XA PREPARE '" . $gtrid2 . "'";
							$mysqli_02->query($sql);
							
							
							$bool1 = false;
							$sql = "XA RECOVER";
							$rsXARecover = $mysqli_01->query($sql);
							while ($rowXARecover = $rsXARecover->fetch_object()) {
								if ($rowXARecover->data==$gtrid1) {
									$bool1 = true;
									break;
								}
							}
							
							$bool2 = false;
							$sql = "XA RECOVER";
							$rsXARecover = $mysqli_02->query($sql);
							while ($rowXARecover = $rsXARecover->fetch_object()) {
								if ($rowXARecover->data==$gtrid2) {
									$bool2 = true;
									break;
								}
							}
							
							if ($bool1 && $bool2) {
								$sql = "XA COMMIT '" . $gtrid2 . "'";
								$mysqli_02->query($sql);
								$sql = "XA COMMIT '" . $gtrid1 . "'";
								$mysqli_01->query($sql);
							} else {
								$sql = "XA ROLLBACK '" . $gtrid2 . "'";
								$mysqli_02->query($sql);
								$sql = "XA ROLLBACK '" . $gtrid1 . "'";
								$mysqli_01->query($sql);
							}
						} catch (Exception $e) {
							$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='transferencia', detalle='" . $this->mysqli->real_escape_string($e->getMessage() . " | " . $sql) . "', id_transmision=" . $id_transmision;
							$this->mysqli->query($sql);
						}
						
						$mysqli_02->close();
						
					} else {
						$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión remota', detalle='" . $this->mysqli->real_escape_string($php_errormsg) . "'";
						$this->mysqli->query($sql);
					}
				}
				
				$sql = "SELECT RELEASE_LOCK('" . "transmision_" . $id_sucursal2 . "')";
				$rs = $mysqli_01->query($sql);
			} else {
				$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal2 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='comunicación ocupada', detalle='" . $this->mysqli->real_escape_string($sucursal->descrip) . "'";
				$this->mysqli->query($sql);
			}
			
			$mysqli_01->close();

		} else {
			$sql = "INSERT transmision_error SET id_sucursal=" . $id_sucursal1 . ", tipo='actualizacion', hora='" . date("H:i:s") . "', descrip='conexión local', detalle='" . $this->mysqli->real_escape_string($php_errormsg) . "'";
			$this->mysqli->query($sql);
		}
	}
  }
  
  
  public function method_transmitir_stock($params, $error) {
  	set_time_limit(0);
  	
  	$id_sucursal = $this->rowParamet->id_sucursal;
  	
	$sql = "SELECT id_producto_item, stock FROM stock WHERE id_sucursal=" . $id_sucursal . " AND transmitir";
	$rs = $this->mysqli->query($sql);
	if ($rs->num_rows > 0) {
		$this->mysqli->query("START TRANSACTION");

		while ($row = $rs->fetch_object()) {
			foreach ($this->arrayDeposito as $deposito) {
				if ($deposito->id_sucursal != $id_sucursal) {
					$sql="UPDATE stock SET stock = '" . $row->stock . "' WHERE id_sucursal='" . $id_sucursal . "' AND id_producto_item='" . $row->id_producto_item . "'";
					$this->transmitir($sql, $deposito->id_sucursal, "Transmisión stock");
					
					$sql="UPDATE stock SET transmitir = FALSE WHERE id_sucursal=" . $id_sucursal . " AND id_producto_item='" . $row->id_producto_item . "'";
					$this->mysqli->query($sql);
				}
			}
		}
		
		$this->mysqli->query("COMMIT");
	}  	
  }
  
  
  
  public function method_leer_transmision_error($params, $error) {
  	$resultado = array();
  	
  	foreach ($this->arraySucursal as $sucursal) {
  		$resultado[$sucursal->id_sucursal] = array();
  	}
  	
	$sql = "SELECT * FROM transmision_error ORDER BY id_transmision_error";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$resultado[$row->id_sucursal][] = $row;
	}
  	
  	return $resultado;
  }
}

?>