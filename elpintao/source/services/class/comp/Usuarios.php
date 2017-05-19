<?php

require_once("Base.php");

class class_Usuarios extends class_Base
{
  
  
  public function method_leer_usuario($params, $error) {
	$p = $params[0];
	
	$sql = "SELECT * FROM usuario WHERE nick LIKE '" . $p->nick . "'";
	$rs = mysql_query($sql);
	if (mysql_num_rows($rs) > 0) {
		$row = mysql_fetch_object($rs);
		if ($row->password == md5($p->password)) {
			$row->perfil = new stdClass;
			
			$sql = "SELECT id_perfil FROM usuario_perfiles WHERE id_usuario=" . $row->id_usuario ;
			$rsPerfil = mysql_query($sql);
			while ($rowPerfil = mysql_fetch_object($rsPerfil)) {
				$row->perfil->{$rowPerfil->id_perfil} = true;
			}
			
			return $row;
		} else {
			$error->SetError(0, "password");
			return $error;
		}
	} else {
		$error->SetError(0, "nick");
		return $error;
	}
  }
}

?>