<?php

require_once("Base_general.php");

class class_Base_elpintao_sin_sesion extends class_Base_general
{
	protected $mysqli;
	protected $rowParamet;
	protected $arraySucursal;
	protected $arrayDeposito;
	
	function __construct() {
		
		require("Conexion.php");
		
		$aux = new mysqli_driver;
		$aux->report_mode = MYSQLI_REPORT_ERROR;
		//$aux->report_mode = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT;
		//mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		
		date_default_timezone_set("America/Argentina/Buenos_Aires");
		
		$this->mysqli = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$this->mysqli->query("SET NAMES 'utf8'");
	
		$this->method_leer_paramet(null, null);
		$this->method_leer_sucursales(null, null);
		$this->method_leer_depositos(null, null);
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
		$row->arancel = (float) $row->arancel;
		
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
		$row->arancel = (float) $row->arancel;
		
		$this->arrayDeposito[$row->id_sucursal] = $row;
	}

	return $this->arrayDeposito;
  }
  
  
  public function method_buscar_historico_precio($params, $error) {
	$p = $params[0];
	
	$p->fecha = substr($p->fecha, 0, 10);
	
	$sql = "SELECT";
	$sql.= "  iva";
	$sql.= ", desc_producto";
	$sql.= ", desc_fabrica";
	$sql.= ", precio_lista";
	$sql.= ", remarc_final";
	$sql.= ", remarc_mayorista";
	$sql.= ", desc_final";
	$sql.= ", desc_mayorista";
	$sql.= ", bonif_final";
	$sql.= ", bonif_mayorista";
	$sql.= ", comision_vendedor";
	$sql.= " FROM historico_precio";
	$sql.= " WHERE DATE(fecha)<='" . $p->fecha . "' AND id_producto_item=" . $p->id_producto_item;
	$sql.= " ORDER BY fecha DESC LIMIT 1";
	
	$rs = $this->mysqli->query($sql);
	
	if ($rs->num_rows == 0) {
		$sql = "SELECT";
		$sql.= "  producto.iva";
		$sql.= ", producto.desc_producto";
		$sql.= ", fabrica.desc_fabrica";
		$sql.= ", producto_item.precio_lista";
		$sql.= ", producto_item.remarc_final";
		$sql.= ", producto_item.remarc_mayorista";
		$sql.= ", producto_item.desc_final";
		$sql.= ", producto_item.desc_mayorista";
		$sql.= ", producto_item.bonif_final";
		$sql.= ", producto_item.bonif_mayorista";
		$sql.= ", producto_item.comision_vendedor";
		$sql.= " FROM (producto_item INNER JOIN producto USING(id_producto)) INNER JOIN fabrica USING(id_fabrica)";
		$sql.= " WHERE id_producto_item=" . $p->id_producto_item;
		
		$rs = $this->mysqli->query($sql);
	}

	$row = $rs->fetch_object();
	
	$row->iva = (float) $row->iva;
	$row->desc_producto = (float) $row->desc_producto;
	$row->desc_fabrica = (float) $row->desc_fabrica;
	$row->precio_lista = (float) $row->precio_lista;
	$row->remarc_final = (float) $row->remarc_final;
	$row->remarc_mayorista = (float) $row->remarc_mayorista;
	$row->desc_final = (float) $row->desc_final;
	$row->desc_mayorista = (float) $row->desc_mayorista;
	$row->bonif_final = (float) $row->bonif_final;
	$row->bonif_mayorista = (float) $row->bonif_mayorista;
	$row->comision_vendedor = (float) $row->comision_vendedor;
	
	return $row;
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