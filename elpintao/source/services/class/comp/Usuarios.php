<?php

require_once("Base.php");

class class_Usuarios extends class_Base
{
  
  
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
		
		$_SESSION['usuario'] = $row;
		
		return $row;

	} else {
		$error->SetError(0, "password");
		return $error;
	}
  }
}

?>