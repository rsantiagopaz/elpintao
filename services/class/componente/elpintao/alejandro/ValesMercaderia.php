<?php

require("Base.php");

class class_ValesMercaderia extends class_Base {


	public function method_entregarVale($params, $error) {
		$p = $params[0];
		
		$qVale = $this->db->query("
		SELECT valesmercaderia.*
		FROM valesmercaderia
		INNER JOIN paramet ON valesmercaderia.id_sucursal_retira = paramet.id_sucursal
		WHERE nro_vale = '" . $p->nro_vale . "'
		LIMIT 1
		");

		$rVale = $qVale->fetch_object();

		if ($qVale->num_rows > 0) {
			$sql = "
			UPDATE valesmercaderia SET
			estado = 'T'
			WHERE nro_vale = '" . $rVale->nro_vale . "'
			LIMIT 1
			";

			$this->db->query($sql);

			if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); $this->db->query("ROLLBACK"); return $error; }

			if ($this->db->affected_rows > 0) {

				$this->transmitir($sql);

				if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); $this->db->query("ROLLBACK"); return $error; }

				$sql = "
				UPDATE stock
				INNER JOIN valesmercaderia_items USING(id_producto_item)
				SET stock = stock - valesmercaderia_items.cantidad
				WHERE valesmercaderia_items.id_valemercaderia = '" . $rVale->id_valemercaderia . "'
				AND stock.id_sucursal = (SELECT paramet.id_sucursal FROM paramet LIMIT 1) 
				";

				$this->db->query($sql);

				if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); $this->db->query("ROLLBACK"); return $error; }

				$q = $this->db->query("
				INSERT INTO stock_log SET
				descrip = 'CantidadesStock Facturacion.ValesMercaderia.method_entregarVale',
				sql_texto = '" . $this->db->real_escape_string($sql) . "'
				");

				if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); $this->db->query("ROLLBACK"); return $error; }
			}

			if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }
		} else {
			$error->SetError(JsonRpcError_Unknown, "El Vale seleccionado no es para ser entregado en su Sucursal."); return $error;
		}

		return true;
	}
}
?>
