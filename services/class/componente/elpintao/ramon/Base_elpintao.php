<?php

session_start();

require_once($_SESSION['conexion']->require_general_services . "class/componente/general/ramon/" . "Base_general.php");

class class_Base_elpintao extends class_Base_general
{
	protected $link1;
	protected $rowParamet;
	protected $arraySucursal;
	protected $arrayDeposito;
	
	function __construct() {
		if (! is_null($_SESSION['conexion']->servidor)) {
			$this->link1 = mysql_connect($_SESSION['conexion']->servidor, $_SESSION['conexion']->usuario, $_SESSION['conexion']->password);
			mysql_select_db($_SESSION['conexion']->database, $this->link1);
			mysql_query("SET NAMES 'utf8'", $this->link1);
		
			$this->method_leer_paramet(null, null);
			$this->method_leer_sucursales(null, null);
			$this->method_leer_depositos(null, null);
		}
	}
	
	
  public function method_leer_paramet($params, $error) {
	$sql="SELECT * FROM paramet";
	$rsParamet = mysql_query($sql, $this->link1);
	$this->rowParamet = mysql_fetch_object($rsParamet);
	$this->rowParamet->nro_sucursal = (int) $this->rowParamet->nro_sucursal;
	$this->rowParamet->nro_remito = (int) $this->rowParamet->nro_remito;

	return $this->rowParamet;
  }
  
  
  public function method_leer_sucursales($params, $error) {
  	$this->arraySucursal = array();
	$sql = "SELECT * FROM sucursal WHERE activo ORDER BY descrip";
	$rs = mysql_query($sql, $this->link1);
	while ($row = mysql_fetch_object($rs)) {
		$row->deposito = (bool) $row->deposito;
		
		$this->arraySucursal[$row->id_sucursal] = $row;
	}

	return $this->arraySucursal;
  }
  
  public function method_leer_depositos($params, $error) {
  	$this->arrayDeposito = array();
	$sql = "SELECT * FROM sucursal WHERE activo AND deposito ORDER BY descrip";
	$rs = mysql_query($sql, $this->link1);
	while ($row = mysql_fetch_object($rs)) {
		$row->deposito = (bool) $row->deposito;
		
		$this->arrayDeposito[$row->id_sucursal] = $row;
	}

	return $this->arrayDeposito;
  }
  
  
  public function functionCalcularImportes(&$obj) {
	$obj->plmasiva = $obj->precio_lista + ($obj->precio_lista * $obj->iva / 100);
	
	$obj->costo = $obj->plmasiva;
	$obj->costo = $obj->costo - ($obj->costo * $obj->desc_fabrica / 100);
	$obj->costo = $obj->costo - ($obj->costo * $obj->desc_producto / 100);
	
	$obj->pcf = $obj->costo + ($obj->costo * $obj->remarc_final / 100);
	$obj->pcf = $obj->pcf - (($obj->pcf * $obj->desc_final) / 100);
	
	$obj->pcfcd = $obj->pcf - (($obj->pcf * $obj->bonif_final) / 100);
	
	$obj->utilcf = $obj->pcfcd - $obj->costo;
	
	$obj->pmay = $obj->costo + ($obj->costo * $obj->remarc_mayorista / 100);
	$obj->pmay = $obj->pmay - (($obj->pmay * $obj->desc_mayorista) / 100);
	
	$obj->pmaycd = $obj->pmay - (($obj->pmay * $obj->bonif_mayorista) / 100);
	
	$obj->utilmay = $obj->pmaycd - $obj->costo;
	
	$obj->comision = $obj->pcfcd * $obj->comision_vendedor / 100;
  }
  
  
  public function transmitir($sql_texto, $id_sucursal = null, $descrip = "") {
  	if (is_null($id_sucursal)) {
  		foreach ($this->arraySucursal as $sucursal) {
  			if ($sucursal->id_sucursal != $this->rowParamet->id_sucursal) {
  				$sql = "INSERT transmision SET id_sucursal='" . $sucursal->id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . mysql_real_escape_string($sql_texto, $this->link1) . "'";
  				$this->sql_query($sql, $this->link1);
  			}
  		}
  	} else {
		$sql = "INSERT transmision SET id_sucursal='" . $id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . mysql_real_escape_string($sql_texto, $this->link1) . "'";
  		$this->sql_query($sql, $this->link1);
  	}
  }
}

?>