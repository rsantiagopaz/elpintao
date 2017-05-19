<?php

require_once("Base.php");

class class_Cuentas extends class_Base
{
  
  
  public function method_eliminar_cuenta($params, $error) {
  	$p = $params[0];
  	
  	mysql_query("START TRANSACTION");
  	
	$sql = "DELETE FROM cuenta WHERE id_cuenta=" . $p->id_cuenta;
	mysql_query($sql);
	$this->transmitir($sql);
	
	$sql = "DELETE FROM cuenta_tipo_gasto WHERE id_cuenta=" . $p->id_cuenta;
	mysql_query($sql);
	$this->transmitir($sql);
	
	$sql = "DELETE FROM sucursal_cuenta WHERE id_cuenta=" . $p->id_cuenta;
	mysql_query($sql);
	$this->transmitir($sql);
	
	mysql_query("COMMIT");
  }
  
  
  public function method_eliminar_tipo_gasto($params, $error) {
  	$p = $params[0];
  	
  	mysql_query("START TRANSACTION");
	
	mysql_query("COMMIT");
  }
  

  public function method_escribir_sucursal_cuenta($params, $error) {
  	$p = $params[0];
  	
  	mysql_query("START TRANSACTION");
  	
	$sql = "UPDATE sucursal_cuenta SET marcado=" . (int)$p->marcado . " WHERE id_sucursal_cuenta=" . $p->id_sucursal_cuenta;
	mysql_query($sql);
	$this->transmitir($sql);
	
	mysql_query("COMMIT");
  }
  
  
  public function method_escribir_cuenta_tipo_gasto($params, $error) {
  	$p = $params[0];
  	
  	mysql_query("START TRANSACTION");
  	
	$sql = "UPDATE cuenta_tipo_gasto SET marcado=" . (int)$p->marcado . " WHERE id_cuenta_tipo_gasto=" . $p->id_cuenta_tipo_gasto;
	mysql_query($sql);
	$this->transmitir($sql);
	
	mysql_query("COMMIT");
  }
  
  
  public function method_leer_tipos_gastos($params, $error) {
  	$p = $params[0];
  	
  	$resultado = array();
  	
	if ($p->id_padre == "0") {
		$sql = "SELECT tipo_gasto.*, 0 AS marcado, '0' AS id_cuenta_tipo_gasto, '' AS importe FROM tipo_gasto WHERE id_padre=" . $p->id_padre;
	} else {
		$sql = "SELECT cuenta_tipo_gasto.*, tipo_gasto.id_padre, tipo_gasto.descrip FROM tipo_gasto INNER JOIN cuenta_tipo_gasto USING(id_tipo_gasto) WHERE id_padre=" . $p->id_padre . " AND id_sucursal=" . $p->id_sucursal . " AND id_cuenta=" . $p->id_cuenta . " ORDER BY descrip";
	}
	$rsTipo_gasto = mysql_query($sql);
	while ($rowTipo_gasto = mysql_fetch_object($rsTipo_gasto)) {
		//$opciones = array("seleccion"=>"bool", "importe"=>"float");
		//$sql = "SELECT cuenta.descrip, tipo_gasto_cuenta.* FROM cuenta INNER JOIN tipo_gasto_cuenta USING(id_cuenta) WHERE tipo_gasto_cuenta.id_tipo_gasto=" . $rowTipo_gasto->id_tipo_gasto . " ORDER BY cuenta.descrip";
		//$rowTipo_gasto->cuenta = $this->toJson($sql, $opciones);
		
		$rowTipo_gasto->marcado = (bool) $rowTipo_gasto->marcado;
		$p->id_padre = $rowTipo_gasto->id_tipo_gasto;
		$rowTipo_gasto->hijos = $this->method_leer_tipos_gastos($params, $error);
		$resultado[] = $rowTipo_gasto;
	}
	
  	return $resultado;
  }
  
  
  public function method_leer_cuentas($params, $error) {
  	$p = $params[0];
  	
  	//$opciones = array("seleccion"=>"bool", "importe"=>"float");
	//$sql = "SELECT cuenta.*, FALSE AS seleccion, 0 AS importe FROM cuenta ORDER BY descrip";
	
	$opciones = array("marcado"=>"bool");
	$sql = "SELECT sucursal_cuenta.*, cuenta.descrip FROM sucursal_cuenta INNER JOIN cuenta USING(id_cuenta) WHERE id_sucursal=" . $p->id_sucursal . " ORDER BY descrip";
	return $this->toJson($sql, $opciones);
  }
  
  
  public function method_alta_modifica_tipo_gasto($params, $error) {
  	$p = $params[0];
  	
  	$resultado = null;
  	
  	if ($p->id_tipo_gasto=="0") {
  		$sql = "SELECT id_sucursal FROM sucursal";
  		$sucursal = $this->toJson($sql);
  		
  		$sql = "SELECT id_cuenta FROM cuenta";
  		$cuenta = $this->toJson($sql);
  		
  		mysql_query("START TRANSACTION");
  		
		$sql = "INSERT tipo_gasto SET id_padre=" . $p->id_padre . ", descrip='" . $p->descrip . "'";
		mysql_query($sql);
		$id_tipo_gasto = mysql_insert_id();
		$resultado = $id_tipo_gasto;
		$sql.= ", id_tipo_gasto=" . $id_tipo_gasto;
		$this->transmitir($sql);
		
		foreach ($sucursal as $row_sucursal) {
			foreach ($cuenta as $row_cuenta) {
				$sql = "INSERT cuenta_tipo_gasto SET id_sucursal=" . $row_sucursal->id_sucursal . ", id_cuenta=" . $row_cuenta->id_cuenta . ", id_tipo_gasto=" . $id_tipo_gasto . ", marcado=0, importe=0";
				mysql_query($sql);
				$id_cuenta_tipo_gasto = mysql_insert_id();
				$sql.= ", id_cuenta_tipo_gasto=" . $id_cuenta_tipo_gasto;
				$this->transmitir($sql);
			}
		}
		
		mysql_query("COMMIT");
  	} else {
  		mysql_query("START TRANSACTION");
  		
		$sql = "UPDATE tipo_gasto SET descrip='" . $p->descrip . "' WHERE id_tipo_gasto=" . $p->id_tipo_gasto;
		mysql_query($sql);
		$this->transmitir($sql);
		
		mysql_query("COMMIT");
  	}
  	
  	return $resultado;
  }
  
  
  public function method_alta_modifica_cuenta($params, $error) {
  	$p = $params[0];
  	
  	$resultado = null;
  	
  	if ($p->id_cuenta=="0") {
  		$sql = "SELECT id_sucursal FROM sucursal";
  		$sucursal = $this->toJson($sql);
  		
  		$sql = "SELECT id_tipo_gasto FROM tipo_gasto WHERE id_tipo_gasto <> 1";
  		$tipo_gasto = $this->toJson($sql);
  		
  		mysql_query("START TRANSACTION");
  		
		$sql = "INSERT cuenta SET descrip='" . $p->descrip . "'";
		mysql_query($sql);
		$id_cuenta = mysql_insert_id();
		$resultado = $id_cuenta;
		$sql.= ", id_cuenta=" . $id_cuenta;
		$this->transmitir($sql);
		
		foreach ($sucursal as $row_sucursal) {
			$sql = "INSERT sucursal_cuenta SET id_sucursal=" . $row_sucursal->id_sucursal . ", id_cuenta=" . $id_cuenta . ", marcado=0";
			mysql_query($sql);
			$id_sucursal_cuenta = mysql_insert_id();
			$sql.= ", id_sucursal_cuenta=" . $id_sucursal_cuenta;
			$this->transmitir($sql);
			
			foreach ($tipo_gasto as $row_tipo_gasto) {
				$sql = "INSERT cuenta_tipo_gasto SET id_sucursal=" . $row_sucursal->id_sucursal . ", id_cuenta=" . $id_cuenta . ", id_tipo_gasto=" . $row_tipo_gasto->id_tipo_gasto . ", marcado=0, importe=0";
				mysql_query($sql);
				$id_cuenta_tipo_gasto = mysql_insert_id();
				$sql.= ", id_cuenta_tipo_gasto=" . $id_cuenta_tipo_gasto;
				$this->transmitir($sql);
			}
		}
		
		mysql_query("COMMIT");
  	} else {
  		mysql_query("START TRANSACTION");
  		
		$sql = "UPDATE cuenta SET descrip='" . $p->descrip . "' WHERE id_cuenta=" . $p->id_cuenta;
		mysql_query($sql);
		$this->transmitir($sql);
		
		mysql_query("COMMIT");
  	}
  	
  	return $resultado;
  }
}

?>