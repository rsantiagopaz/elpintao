<?php

require_once("Base_general.php");

class class_Inicial extends class_Base_general
{
	protected $id_login;
	protected $mysqli;
	
	function __construct() {
		
		require_once("Conexion.php");
		
		$aux = new mysqli_driver;
		$aux->report_mode = MYSQLI_REPORT_ERROR;
		//$aux->report_mode = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT;
		//mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
		
		date_default_timezone_set("America/Argentina/Buenos_Aires");
		
		$this->mysqli = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
		$this->mysqli->query("SET NAMES 'utf8'");
		
		
		$request_uri = $_SERVER['REQUEST_URI'];
		$build = strstr($request_uri, 'build', true);
		$source = strstr($request_uri, 'source', true);
		if ($build) {
			$request_uri = $build . 'build';
		} else if ($source) {
			$request_uri = $source . 'source';
		} else {
			die('REQUEST_URI');
		}
		
		$this->id_login = md5($request_uri);
	}
	
	
  public function method_leer_inicial($params, $error) {
  	
  	$aux = new stdClass;
  	
  	
  	$aux->id_version = 5;
  	
  	
  	$aux->login = $_SESSION[$this->id_login];
	
	return $aux;
  }
  
  
  public function method_leer_usuario($params, $error) {
	$p = $params[0];
	
	$sql = "SELECT * FROM usuario WHERE id_usuario=" . $p->id_usuario . " AND password=MD5('" . $p->password . "')";
	$rs = $this->mysqli->query($sql);
	if ($rs->num_rows > 0) {
		$row = $rs->fetch_object();

		$row->perfil = new stdClass;
		
		$sql = "SELECT id_perfil FROM usuario_perfiles WHERE id_usuario=" . $row->id_usuario ;
		$rsPerfil = $this->mysqli->query($sql);
		while ($rowPerfil = $rsPerfil->fetch_object()) {
			$row->perfil->{$rowPerfil->id_perfil} = true;
		}

		$_SESSION[$this->id_login] = $row;
		
		return $row;

	} else {
		$error->SetError(0, "password");
		return $error;
	}
  }
  
  
  public function method_cerrar_sesion($params, $error) {
  	
  	$_SESSION[$this->id_login] = null;

  }
  
  
  public function method_autocompletarUsuario($params, $error) {
  	$p = $params[0];
  	
  	if (is_numeric($p->texto)) {
		$sql = "SELECT CONCAT(nro_vendedor, ' (', TRIM(nick), ')') AS label, nick AS model, id_usuario FROM usuario WHERE nro_vendedor LIKE '" . $p->texto . "%' ORDER BY label";
  	} else {
  		$sql = "SELECT CONCAT(TRIM(nick), ' (', nro_vendedor, ')') AS label, nick AS model, id_usuario FROM usuario WHERE nick LIKE '%" . $p->texto . "%' ORDER BY label";
  	}
	return $this->toJson($sql);
  }
}

?>