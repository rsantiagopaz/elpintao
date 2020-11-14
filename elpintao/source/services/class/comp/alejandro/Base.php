<?php
class class_Base
{
	protected $link1;
	protected $link2;
	protected $rowParamet;
	protected $arraySucursal;

	function __construct() {
		require('../conexion.php');

		/*
		$this->link1 = mysql_connect("$conexion->servidor", "$conexion->usuario", "$conexion->password");
		mysql_select_db("$conexion->database", $this->link1);
		mysql_query("SET NAMES 'utf8'", $this->link1);
		*/

		$this->link1 = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$this->link1->query("SET NAMES 'utf8'");

		$this->db = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$this->db->query("SET NAMES 'utf8'");

		$this->link2 = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$this->link2->query("SET NAMES 'utf8'");

		$this->method_leer_paramet(null, null);
		$this->method_leer_sucursales(null, null);
	}

	public static function getConfiguraciones () {
		require('conexion.php');
		$db = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$db->query("SET NAMES 'utf8'");

		$q = $db->query("
		SELECT * FROM configuraciones
		");
		$r = $q->fetch_object();
		return $r;
	}

	public static function addInteresLista ($num, $interes) {
		$x = - (10000*$num) / ($interes*$interes - 10000);
		$x = $x + $x * $interes / 100;
		return $x;
	}
	public static function delInteresLista ($num, $interes) {
		$x = $num - ($num * $interes / 100);
		return $x;
	}

	public static function ClearDecZero ($num) {
		return trim(trim($num, '0'), '.');
	}


  public function method_leer_paramet($params, $error) {
  	require('conexion.php');
  	$db = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
  	$db->query("SET NAMES 'utf8'");

	$sql="SELECT * FROM paramet";
	$rsParamet = $db->query($sql);
	$this->rowParamet = $rsParamet->fetch_object();
	$this->rowParamet->nro_sucursal = (int) $this->rowParamet->nro_sucursal;
	$this->rowParamet->nro_remito = (int) $this->rowParamet->nro_remito;

	return $this->rowParamet;
  }


  public function method_leer_sucursales($params, $error) {
  	$this->arraySucursal = array();
	$sql = "SELECT * FROM sucursal WHERE activo ORDER BY descrip";
	$rs = $this->db->query($sql);
	while ($row = $rs->fetch_object()) {
		$this->arraySucursal[$row->id_sucursal] = $row;
	}

	return $this->arraySucursal;
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


  public function sql_query($query, &$lnk = null) {
  	$resultado = null;
  	$errno = 0;
  	if (is_null($lnk)) {
  		$errno = $this->db->errno;
  		$resultado = $this->db->query($query);
  		if ($errno) throw new Exception($this->db->error, $errno);
  	} else {
  		$resultado = $lnk->query($query);
  		$errno = $lnk->errno;
  		if ($errno) throw new Exception($lnk->error, $errno);
  	}
  	return $resultado;
  }


  public function transmitir($sql_texto, $id_sucursal = null, $descrip = "") {
  	if (is_null($id_sucursal)) {
  		foreach ($this->arraySucursal as $sucursal) {
  			if ($sucursal->id_sucursal != $this->rowParamet->id_sucursal) {
  				$sql = "INSERT transmision SET id_sucursal='" . $sucursal->id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->db->real_escape_string($sql_texto) . "'";
  				$this->sql_query($sql, $this->db);
  			}
  		}
  	} else {
		$sql = "INSERT transmision SET id_sucursal='" . $id_sucursal . "', descrip='" . $descrip . "', sql_texto='" . $this->db->real_escape_string($sql_texto, $this->db) . "'";
  		$this->sql_query($sql, $this->db);
  	}
  }


  public function toJson($paramet, &$opciones = null) {
	if (is_string($paramet)) {
		$cadena = strtoupper(substr(trim($paramet), 0, 6));
		if ($cadena=="INSERT" || $cadena=="SELECT") {
			$paramet = @$this->db->query($paramet);
			if ($this->db->errno > 0) {
				return $this->db->errno . " " . $this->db->error . "\n";
			} else if ($cadena=="INSERT"){
				//$nodo=$xml->addChild("insert_id", mysql_insert_id());
			} else {
				return $this->toJson($paramet, $opciones);
			}
		}
	} else if (is_resource($paramet)) {
		$rows = array();
		if (is_null($opciones)) {
			while ($row = $paramet->fetch_object()) {
				$rows[] = $row;
			}
		} else {
			while ($row = $this->db->fetch_object()) {
				foreach($opciones as $key => $value) {
					if ($value=="int") {
						$row->$key = (int) $row->$key;
					} else if ($value=="float") {
						$row->$key = (float) $row->$key;
					} else if ($value=="bool") {
						$row->$key = (bool) $row->$key;
					} else {
						$value($row, $key);
					}
				}

				$rows[] = $row;
			}
		}
		return $rows;
	}
  }


  public function prepararCampos(&$model, $tabla = null) {
  	static $campos = array();
	$set = array();
	$chequear = false;
	if (!is_null($tabla)) {
		$chequear = true;
		if (is_null($campos[$tabla])) {
			$campos[$tabla] = array();
			$rs = $this->db->query("SHOW COLUMNS FROM " . $tabla);
			while ($row = $this->db->fetch_assoc()) {
				$campos[$tabla][$row['Field']] = true;
			}
		}
	}
	foreach($model as $key => $value) {
		if ($chequear) {
			if (!is_null($campos[$tabla][$key])) {
				$set[] = $key . "='" . $value . "'";
			}
		} else {
			$set[] = $key . "='" . $value . "'";
		}
	}
	return implode(", ", $set);
  }
}

?>
