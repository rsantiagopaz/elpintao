<?php

session_start();

require_once($_SESSION['conexion']->require_general_services . "class/componente/general/ramon/" . "Base_general.php");

class class_Base_elpintao extends class_Base_general
{
	protected $mysqli;
	protected $rowParamet;
	protected $arraySucursal;
	protected $arrayDeposito;
	
	function __construct() {
		$aux = new mysqli_driver;
		$aux->report_mode = MYSQLI_REPORT_ERROR;
		//$aux->report_mode = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT;
		//mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		
		date_default_timezone_set("America/Argentina/Buenos_Aires");
		
		if (! is_null($_SESSION['conexion']->servidor)) {
			$this->mysqli = new mysqli($_SESSION['conexion']->servidor, $_SESSION['conexion']->usuario, $_SESSION['conexion']->password, $_SESSION['conexion']->database);
			$this->mysqli->query("SET NAMES 'utf8'");
		
			$this->method_leer_paramet(null, null);
			$this->method_leer_sucursales(null, null);
			$this->method_leer_depositos(null, null);
		}
	}
	
	
  public function method_leer_paramet($params, $error) {
	$sql="SELECT * FROM paramet";
	$rsParamet = $this->mysqli->query($sql);
	$this->rowParamet = $rsParamet->fetch_object();
	$this->rowParamet->nro_sucursal = (int) $this->rowParamet->nro_sucursal;
	$this->rowParamet->nro_remito = (int) $this->rowParamet->nro_remito;

	return $this->rowParamet;
  }
  
  
  public function method_leer_sucursales($params, $error) {
  	$this->arraySucursal = array();
	$sql = "SELECT * FROM sucursal WHERE activo ORDER BY descrip";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$row->deposito = (bool) $row->deposito;
		
		$this->arraySucursal[$row->id_sucursal] = $row;
	}

	return $this->arraySucursal;
  }
  
  public function method_leer_depositos($params, $error) {
  	$this->arrayDeposito = array();
	$sql = "SELECT * FROM sucursal WHERE activo AND deposito ORDER BY descrip";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
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
  				$sql = "INSERT transmision SET id_sucursal='" . $sucursal->id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->mysqli->real_escape_string($sql_texto) . "'";
  				$this->mysqli->query($sql);
  				
  				//$sql = "INSERT transmision_log_ent SET id_sucursal='" . $sucursal->id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->mysqli->real_escape_string($sql_texto) . "'";
  				//$this->mysqli->query($sql);
  			}
  		}
  	} else {
		$sql = "INSERT transmision SET id_sucursal='" . $id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->mysqli->real_escape_string($sql_texto) . "'";
  		$this->mysqli->query($sql);
  		
		//$sql = "INSERT transmision_log_ent SET id_sucursal='" . $id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->mysqli->real_escape_string($sql_texto) . "'";
		//$this->mysqli->query($sql);
  	}
  }
}

?>