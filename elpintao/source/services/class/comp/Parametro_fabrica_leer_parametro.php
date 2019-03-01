<?php
  	
	$sql = "SELECT * FROM " . $p->tabla;
	if (isset($p->{"id_" . $p->tabla})) $sql.= " WHERE id_" . $p->tabla . "=" . $p->{"id_" . $p->tabla};
	$sql.= " ORDER BY descrip";
	$rs = $this->mysqli->query($sql);
	while ($row = $rs->fetch_object()) {
		$row->desc_fabrica = (float) $row->desc_fabrica;
		$row->comision = (float) $row->comision;
		
		$resultado[] = $row;
	}

?>