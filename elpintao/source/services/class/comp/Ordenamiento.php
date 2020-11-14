<?php

require_once("Base_elpintao.php");

class class_Ordenamiento extends class_Base_elpintao
{


  public function method_grabar_indices($params, $error) {
  	$p = $params[0];
  	
	$sql = "UPDATE ordenamiento SET indice = indice + 1 WHERE id_ordenamiento='" . $p->id_ordenamiento1 . "'";
	$this->mysqli->query($sql);
	$sql = "UPDATE ordenamiento SET indice = indice - 1 WHERE id_ordenamiento='" . $p->id_ordenamiento2 . "'";
	$this->mysqli->query($sql);
  }


  public function method_agregar_item($params, $error) {
  	$p = $params[0];
  	
  	$set = $this->prepararCampos($p->model);
	$sql = "INSERT ordenamiento SET " . $set;
	$this->mysqli->query($sql);
	return $this->mysqli->insert_id;
  }

  public function method_leer_items($params, $error) {
  	$p = $params[0];
  	
  	$resultado = array();
  	$sql="SELECT * FROM ordenamiento WHERE tag='" . $p->tag . "' ORDER BY indice";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$resultado[] = $row;
	}

	return $resultado;
  }
  
  public function method_eliminar_item($params, $error) {
  	$p = $params[0];
  	
	$sql = "DELETE FROM ordenamiento WHERE id_ordenamiento='" . $p->id_ordenamiento . "'";
	$this->mysqli->query($sql);
  }
}

?>