<?php

require("Base.php");

class class_Maestros extends class_Base {


	function method_getChequeoStock ($params, $error) {
		$p = $params[0];

        $q = $this->db->query("
        SELECT control_stock FROM configuraciones
        ");
        $r = $q->fetch_object();

        $res = new stdClass();
        //return $res;
        if ($r->control_stock == 'S') {
            $q = $this->db->query("
            SELECT count(*) as cantidad
            FROM stock_chequeos
            WHERE DATE(fyh) = DATE(Now())
            ");
            $r = $q->fetch_object();
            $res->cantidad = $r->cantidad;

            $q = $this->db->query("
            SELECT DISTINCT
            id_producto_item,
            fabrica.descrip as fabrica,
            producto.descrip as producto,
            producto_item.capacidad,
            unidad.descrip as unidad,
            color.descrip as color,
            stock.stock as stock_actual
            FROM ventas_items
            INNER JOIN producto_item USING(id_producto_item)
            INNER JOIN producto USING(id_producto)
            INNER JOIN fabrica USING(id_fabrica)
            INNER JOIN color USING(id_color)
            INNER JOIN unidad ON producto_item.id_unidad= unidad.id_unidad
            INNER JOIN stock USING(id_producto_item)
            INNER JOIN paramet ON stock.id_sucursal = paramet.id_sucursal
            WHERE DATE(ventas_items.fyh) BETWEEN ADDDATE(DATE(NOW()), -120) AND DATE(NOW())
            ORDER BY RAND()
            LIMIT 3
            ");

            $res->items = Array();
            while ($r = $q->fetch_object()) {
                if (substr($r->capacidad, -3) == 0) {
                    $r->capacidad = (float) number_format($r->capacidad, '0', '.', '.');
                } else {
                    $r->capacidad = (float) number_format($r->capacidad, '2', '.', '.');
                }

                $r->producto = $r->fabrica . " - " . $r->producto;

                $res->items []= $r;
            }
        } else {
            $res->cantidad = 1;
            $res->items = Array();
        }

		return $res;
	}

	public function method_getProductos ($params, $error) {
		$p = $params[0];

		$WHERE = " WHERE 1=1 ";
		$WHERE .= " AND producto_item.activo ";

		if ($p->cod_barra) {
			$WHERE .= " AND producto_item.cod_barra LIKE '" . $p->cod_barra . "' ";
		} else {
			$comodin = explode("*", $p->descrip);
			if (count($comodin) >1) {
				$WHERE .= " AND producto_item.capacidad LIKE '" . $comodin[1] . "%' ";
				$p->descrip = $comodin[0];
			}
			$buscar = explode(" ", $p->descrip);
			foreach ($buscar as $palabra) {
				$palabra = trim($palabra);
				if (is_numeric($palabra)) {
					$WHERE .= " AND producto_item.cod_interno LIKE '" . $palabra . "' ";
				} else {
					$WHERE .= " AND producto_item.busqueda LIKE '%" . $palabra . "%' ";
				}
			}
		}

		$sql = "
		SELECT
		DISTINCT
		producto.descrip as producto
		, fabrica.descrip as fabrica
		, CONCAT(producto_item.cod_interno, ' - ', fabrica.descrip, ' - ', producto.descrip, ' - ', color.descrip) as descrip
		, producto_item.id_producto_item
		, producto_item.capacidad
		, color.descrip as color
		, unidad.descrip AS unidad
		, 0 as cantidad
		, 0 as total
		, 0 as ok
		, 0 as stock
		FROM ((producto INNER JOIN moneda USING(id_moneda)) INNER JOIN fabrica USING(id_fabrica))
		INNER JOIN ((producto_item INNER JOIN color USING(id_color)) INNER JOIN unidad USING(id_unidad)) USING(id_producto)
		INNER JOIN stock USING(id_producto_item)
        INNER JOIN paramet USING(id_sucursal)
		";
		$sql.= $WHERE;

		// 		die($sql);

		$rs = $this->db->query($sql);
		while ($reg = $rs->fetch_object()) {

			$reg->total = (float) $reg->total;
			$reg->stock = (float) $reg->stock;
			$reg->capacidad = (float) $reg->capacidad;
			$reg->cantidad = (float) $reg->cantidad;

			$resultado[] = $reg;
		}
		return $resultado;
	}

	function method_getVentasTotales ($params, $error) {
		$p = $params[0];

		// 		switch ($p->id_sucursal) {
		// 			case 11:
		// 				$this->link2 = new mysqli("localhost", "root", "toor", "suc11");
		// 				$this->link2->query("SET NAMES 'utf8'");
		// 			break;
		// 		}
		$db = $this->link2;
		if ($p->base) {
			$urlsql = $p->url;
			$port = null;
			$pos = strpos($urlsql, ":");
			if ($pos !== false && $pos >= 0) {
				$port = (int) substr($urlsql, $pos + 1);
				$urlsql = substr($urlsql, 0, $pos);
			}
			
			$this->link2 = new mysqli($urlsql, $p->username, $p->password, $p->base, $port);
			$this->link2->query("SET NAMES 'utf8'");
		}

		// 		$this->link2 = new mysqli($servidor, $usuario, $password, $base);
		// 		$this->link2->query("SET NAMES 'utf8'");
		// 		["id_sucursal", "sucursal", "total", "m_efectivo", "m_credito", "m_debito", "m_cheque", "m_ctacte", "p_efectivo", "p_credito", "p_debito", "p_cheque", "p_ctacte"]

		$q = $db->query("SELECT
		SUM(formas_pago.e_monto_total) as m_efectivo,
		SUM(
			formas_pago.c_monto_total +
			(formas_pago.c_monto_total * formas_pago.c_interes_tarjeta/100) +
			(formas_pago.c_monto_total + (formas_pago.c_monto_total * formas_pago.c_interes_tarjeta/100)) * formas_pago.c_interes_cuota/100
		) as m_credito,
		SUM(
			formas_pago.d_monto_total +
			(formas_pago.d_monto_total * formas_pago.d_interes_tarjeta/100)
		) as m_debito,
		SUM(formas_pago.q_monto_total) as m_cheque,
		SUM(
			formas_pago.t_monto_total +
			(formas_pago.t_monto_total	* formas_pago.t_interes_ctacte/100)
		) as m_ctacte,
		(SELECT COUNT(formas_pago.id_formas_pago)
			FROM ventas
			INNER JOIN formas_pago USING(id_formas_pago)
			WHERE formas_pago.q_monto_total > 0
			AND ventas.fecha BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
		) as cheques
		FROM ventas
		INNER JOIN formas_pago USING(id_formas_pago)
		WHERE ventas.fecha BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
		AND ventas.estado IN ('A')
		");

		$res = Array();
		if ($q->num_rows) {
			while ($r = $q->fetch_object()) {
				$r->id_sucursal = $p->id_sucursal;
				$r->sucursal = $p->sucursal;
				$r->m_efectivo = (float) ($r->m_efectivo + $r->m_cheque);
				$r->m_tarjeta = (float) ($r->m_credito + $r->m_debito);
				// 				$r->m_debito = (float) $r->m_debito;
				// 				$r->m_cheque = (float) $r->m_cheque;
				$r->m_ctacte = (float) $r->m_ctacte;

				$r->total = (float) ($r->m_efectivo + $r->m_tarjeta + $r->m_ctacte);

				if ($r->total) {
					$r->p_efectivo = (float) (($r->m_efectivo*100) / $r->total);
					$r->p_tarjeta = (float) (($r->m_tarjeta*100) / $r->total);
					// 					$r->p_credito = (float) (($r->m_credito*100) / $r->total);
					// 					$r->p_debito = (float) (($r->m_debito*100) / $r->total);
					// 					$r->p_cheque = (float) (($r->m_cheque*100) / $r->total);
					$r->p_ctacte = (float) (($r->m_ctacte*100) / $r->total);
				} else {
					$r->p_efectivo = (float) 0;
					// 					$r->p_credito = (float) 0;
					// 					$r->p_debito = (float) 0;
					// 					$r->p_cheque = (float) 0;
					$r->p_ctacte = (float) 0;
				}
				$r->cheques = (float) $r->cheques;

				$res []= $r;
			}
		}

		return $res;
	}

	function method_getCantidadesStock ($params, $error) {
		$p = $params[0];

		// 		if ($p->modo != "") {
		// 			$this->link1 = mysql_connect("localhost", $p->username, $p->password);
		// 			mysql_select_db($p->$base, $this->link1);
		// 			mysql_query("SET NAMES 'utf8'", $this->link1);
		// 		}

		if ($p->descrip) {
			$WHERE = " WHERE 1=1 ";
			// 			$WHERE .= " AND ventas.estado = 'A' ";
			// 			$WHERE .= " AND ventas.fecha BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "' ";
			$WHERE .= " AND stock.id_sucursal = paramet.id_sucursal ";
			$WHERE .= " AND producto_item.activo = 1 ";

			if ($p->cod_barra) {
				$WHERE .= " AND producto_item.cod_barra LIKE '" . $p->cod_barra . "' ";
			} else {
				$comodin = explode("*", $p->descrip);
				if (count($comodin) >1) {
					$WHERE .= " AND producto_item.capacidad LIKE '" . $comodin[1] . "%' ";
					$p->descrip = $comodin[0];
				}
				$buscar = explode(" ", $p->descrip);
				foreach ($buscar as $palabra) {
					$palabra = trim($palabra);
					if (is_numeric($palabra)) {
						$WHERE .= " AND producto_item.cod_interno LIKE '" . $palabra . "' ";
					} else {
						$WHERE .= " AND producto_item.busqueda LIKE '%" . $palabra . "%' ";
					}
				}
			}

			$sql = "
			SELECT
			producto_item.id_producto_item,
			stock.stock as cantidad
			, precio_lista
			, iva
			, desc_fabrica
			, desc_producto
			FROM ((producto INNER JOIN moneda USING(id_moneda)) INNER JOIN fabrica USING(id_fabrica))
			INNER JOIN ((producto_item INNER JOIN color USING(id_color)) INNER JOIN unidad USING(id_unidad)) USING(id_producto)
			INNER JOIN stock USING(id_producto_item)
			INNER JOIN paramet USING(id_sucursal)
			";
			$sql.= $WHERE;
			// 			$sql.= $WHERE . " GROUP BY producto_item.id_producto_item";

			$rs = $this->db->query($sql);
			while ($reg = $rs->fetch_object()) {

				// 				$plmasiva = $reg->precio_lista + ($reg->precio_lista * $reg->iva / 100);
				// 				$costo = $plmasiva;
				// 				$costo = $costo - ($costo * $reg->desc_fabrica / 100);
				// 				$costo = $costo - ($costo * $reg->desc_producto / 100);

				// 				$reg->costo = (float) $costo;

				// 				$qRemitos = mysql_query("
				// 				SELECT
				// 				(SELECT SUM(remito_rec_detalle.cantidad) as total
				// 				FROM remito_rec_detalle
				// 				INNER JOIN remito_rec USING(id_remito_rec)
				// 				WHERE remito_rec.id_sucursal_de = '10'
				// 				AND DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_rec_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_dep,
				// 				(SELECT SUM(remito_rec_detalle.cantidad) as total
				// 				FROM remito_rec_detalle
				// 				INNER JOIN remito_rec USING(id_remito_rec)
				// 				WHERE remito_rec.id_sucursal_de != '10'
				// 				AND DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_rec_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_ent,
				// 				(SELECT SUM(remito_emi_detalle.cantidad) as total
				// 				FROM remito_emi_detalle
				// 				INNER JOIN remito_emi USING(id_remito_emi)
				// 				WHERE DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_emi_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_sal
				// 				FROM dual
				// 				");

				// 				$rRemitos = mysql_fetch_object($qRemitos);
				// 				$reg->rec_dep = (float) $rRemitos->rec_dep;
				// 				$reg->rec_ent = (float) $rRemitos->rec_ent;
				// 				$reg->rec_sal = (float) $rRemitos->rec_sal;

				// 				$reg->cantidad = (float) $reg->cantidad;
				$resultado[] = $reg;
			}
		} else {
			/*
			 SELECT
			 ventas_items.id_producto_item
			 , SUM(ventas_items.cantidad) as cantidad
			 , producto.descrip as producto
			 , fabrica.descrip as fabrica
			 , CONCAT(producto_item.cod_interno, ' - ', fabrica.descrip, ' - ', producto.descrip, ' - ', color.descrip) as descrip
			 , producto_item.id_producto_item
			 , producto_item.capacidad
			 , color.descrip as color
			 , unidad.descrip AS unidad
			 FROM ventas
			 INNER JOIN ventas_items USING(id_venta)
			 INNER JOIN producto_item USING(id_producto_item)
			 INNER JOIN producto USING(id_producto)
			 INNER JOIN fabrica USING(id_fabrica)
			 INNER JOIN color USING(id_color)
			 INNER JOIN unidad ON producto_item.id_unidad = unidad.id_unidad
			 WHERE ventas.estado = 'A'
			 AND ventas.fecha BETWEEN '2015-08-01' AND '2015-08-28'
			 GROUP BY ventas_items.id_producto_item
			 */

			$sql = "
			SELECT
			producto.descrip as producto
			, fabrica.descrip as fabrica
			, CONCAT(producto_item.cod_interno, ' - ', fabrica.descrip, ' - ', producto.descrip, ' - ', color.descrip) as descrip
			, producto_item.id_producto_item
			, producto_item.capacidad
			, color.descrip as color
			, unidad.descrip AS unidad
			, stock.stock as cantidad
			, 0 as total
			, 0 as ok
			, 0 as stock
			, precio_lista
			, iva
			, desc_fabrica
			, desc_producto
			FROM ((producto INNER JOIN moneda USING(id_moneda)) INNER JOIN fabrica USING(id_fabrica))
			INNER JOIN ((producto_item INNER JOIN color USING(id_color)) INNER JOIN unidad USING(id_unidad)) USING(id_producto)
			INNER JOIN stock USING(id_producto_item)
			INNER JOIN paramet USING(id_sucursal)
			WHERE	producto_item.activo = 1
			AND stock.id_sucursal = paramet.id_sucursal
			AND fabrica.id_fabrica IN (" . $p->fabricas . ")
			ORDER BY producto_item.capacidad, fabrica.descrip
			";

			$rs = $this->db->query($sql);
			$total_costo = 0;
			$total_litros = 0;
			while ($reg = $rs->fetch_object()) {

				// 				$qRecibidos = mysql_query("
				// 				SELECT SUM(remito_rec_detalle.cantidad) as total
				// 				FROM remito_rec_detalle
				// 				INNER JOIN remito_rec USING(id_remito_rec)
				// 				WHERE remito_rec.id_sucursal_de = '10'
				// 				AND DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_rec_detalle.id_producto_item = '" . $reg->id_producto_item . "'
				// 				");
				if ($reg->cantidad > 0 ) {
					$plmasiva = $reg->precio_lista + ($reg->precio_lista * $reg->iva / 100);
					$costo = $plmasiva;
					$costo = $costo - ($costo * $reg->desc_fabrica / 100);
					$costo = $costo - ($costo * $reg->desc_producto / 100);
					// 				$reg->costo = (float) $costo;
					$reg->costo_unitario = $costo;
					$reg->costo_total = (float) ($costo * $reg->cantidad);;

					$total_costo += (float) ($costo * $reg->cantidad);
				}
				//if ($reg->cantidad != 0) {
					$resultado[] = $reg;
				//}
				switch ($reg->unidad) {
					case "lts":
						$capacidad = (float) $reg->capacidad;
						break;
					case "c.c.":
						$capacidad = (float) $reg->capacidad/1000;
						break;
					case "ml":
						$capacidad = (float) $reg->capacidad/1000;
						break;
					case "un":
					case "kgs":
					case "gr":
					case "mt":
					case "CM":
					case "mm":
					case "CM3":
					case "mts":
						$capacidad = 0;
						break;
					default:
						$capacidad = 0;
						break;
				}
				$total_litros += (float) ($reg->cantidad*$capacidad);
				$reg->litros = (float) ($reg->cantidad*$capacidad);

				if (substr($reg->capacidad, -3) == 0) {
					$reg->capacidad = (float) number_format($reg->capacidad, '0');
				} else {
					$reg->capacidad = (float) number_format($reg->capacidad, '3');
				}

				// 				$qRemitos = mysql_query("
				// 				SELECT
				// 				(SELECT SUM(remito_rec_detalle.cantidad) as total
				// 				FROM remito_rec_detalle
				// 				INNER JOIN remito_rec USING(id_remito_rec)
				// 				WHERE remito_rec.id_sucursal_de = '10'
				// 				AND DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_rec_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_dep,
				// 				(SELECT SUM(remito_rec_detalle.cantidad) as total
				// 				FROM remito_rec_detalle
				// 				INNER JOIN remito_rec USING(id_remito_rec)
				// 				WHERE remito_rec.id_sucursal_de != '10'
				// 				AND DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_rec_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_ent,
				// 				(SELECT SUM(remito_emi_detalle.cantidad) as total
				// 				FROM remito_emi_detalle
				// 				INNER JOIN remito_emi USING(id_remito_emi)
				// 				WHERE DATE(fecha) BETWEEN '" . $p->desde . "' AND '" . $p->hasta . "'
				// 				AND remito_emi_detalle.id_producto_item = '" . $reg->id_producto_item . "') as rec_sal
				// 				FROM dual
				// 				");

				// 				$rRemitos = mysql_fetch_object($qRemitos);
				// 				$reg->rec_dep = (float) $rRemitos->rec_dep;
				// 				$reg->rec_ent = (float) $rRemitos->rec_ent;
				// 				$reg->rec_sal = (float) $rRemitos->rec_sal;

				// 				$reg->total = (float) $reg->total;
				// 				$reg->ok = (float) 0;
				// 				$reg->stock = (float) $reg->stock;
				// 				$reg->capacidad = (float) $reg->capacidad;
				// 				$reg->cantidad = (float) $reg->cantidad;
				// 				$reg->suma = (float) $reg->cantidad;


			}
			$reg = new stdClass();
			$reg->id_producto = 0;
			$reg->fabrica = "TOTALES";
			$reg->producto = "TOTALES";
			$reg->costo_total = $total_costo;
			$reg->litros = $total_litros;
			$resultado[] = $reg;
			// 			$reg = new stdClass();
			// 			$reg->id_producto = 0;
			// 			$reg->fabrica = "LITROS TOTAL";
			// 			$reg->producto = "LITROS TOTAL";
			// 			$reg->total = $total_litros;
			// 			$resultado[] = $reg;

		}
		return $resultado;
	}

	function method_getRankingCantidadesVendidas ($params, $error) {
		$p = $params[0];

		$this->db->query("
		SET sql_mode = '';
		");
		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$this->db->query("
		SET @desde:='" . $p->desde . "';
		");
		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$this->db->query("
		SET @hasta:='" . $p->hasta . "';
		");
		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		if ($p->id_fabrica) {
			$FABRICA = " AND fabrica.id_fabrica IN ('" . $p->id_fabrica . "') ";
		} else {
			$FABRICA = " ";
		}

		$this->db->query("
		CREATE TEMPORARY TABLE ranking
		SELECT (SELECT sucursal FROM configuraciones LIMIT 1) AS id_sucursal,
		elpintao.ventas_items.id_producto_item,
		elpintao.ventas_items.descrip,
		elpintao.ventas_items.capacidad,
		elpintao.ventas_items.id_unidad,
		SUM(elpintao.ventas_items.cantidad) AS cantidad
		FROM elpintao.ventas_items
		INNER JOIN elpintao.ventas USING ( id_venta )
		INNER JOIN elpintao.producto_item USING(id_producto_item)
		INNER JOIN producto USING(id_producto)
		INNER JOIN fabrica USING(id_fabrica)
		WHERE elpintao.ventas.estado = 'A'
		 " . $FABRICA . "
		AND elpintao.ventas.fecha BETWEEN @desde AND @hasta
		AND elpintao.producto_item.activo = '1'
		GROUP BY elpintao.ventas_items.id_producto_item
		");
		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }


		$q = $this->db->query("
		SELECT
		ranking.id_producto_item,
		ranking.descrip as producto,
		ranking.capacidad,
		ranking.id_unidad as unidad,
		SUM(ranking.cantidad) as cantidad
		FROM ranking
		GROUP BY ranking.id_producto_item
		ORDER BY cantidad DESC;
		");
		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();
		while ($r = $q->fetch_object()) {

			$sql = "
			SELECT
			precio_lista
			, iva
			, desc_fabrica
			, desc_producto
			FROM producto
			INNER JOIN fabrica USING(id_fabrica)
			INNER JOIN producto_item USING(id_producto)
			WHERE producto_item.activo = 1
			AND producto_item.id_producto_item = '" . $r->id_producto_item . "'
			";

			$qCosto = $this->db->query($sql);
			$rs = $qCosto->fetch_object();

			$plmasiva = $rs->precio_lista + ($rs->precio_lista * $rs->iva / 100);
			$costo = $plmasiva;
			$costo = $costo - ($costo * $rs->desc_fabrica / 100);
			$costo = $costo - ($costo * $rs->desc_producto / 100);
			// 				$reg->costo = (float) $costo;
			$r->costo = $costo;
			$r->costo_total = (float) ($costo * $r->cantidad);;

			switch ($r->unidad) {
				case "lts":
					$capacidad = (float) $r->capacidad;
					break;
				case "c.c.":
					$capacidad = (float) $r->capacidad/1000;
					break;
				case "ml":
					$capacidad = (float) $r->capacidad/1000;
					break;
				case "un":
				case "kgs":
				case "gr":
				case "mt":
				case "CM":
				case "mm":
				case "CM3":
				case "mts":
					$capacidad = 0;
					break;
				default:
					$capacidad = 0;
					break;
			}

			$total_litros += (float) ($r->cantidad*$capacidad);
			$total_costo += (float) $r->costo_total;
			$r->ltst = (float) ($r->cantidad*$capacidad);

			$r->capacidad = (float) $r->capacidad;
			$r->cantidad = (float) $r->cantidad;
			$res []= $r;
		}
		$r = new stdClass();
		$r->producto = "TOTAL DE LITROS";
		$r->ltst = $total_litros;
		$r->costo_total = $total_costo;
		$res []= $r;

		return $res;
	}

	function method_getFabricas ($params, $error) {
		$p = $params[0];
		$db = $this->link2;

		$q = $db->query("
		SELECT
		id_fabrica as value,
		descrip as label
		FROM fabrica
		ORDER BY descrip
		");

		$res = Array();

		if ($p->add) {
			$res []= $p->add;
		}
		while ($r = $q->fetch_object()) {
			$res []= $r;
		}

		return $res;
	}

	function method_getRemitosEmitidos($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT id_remito_emi as value,
		nro_remito as label
		FROM remito_emi
		WHERE estado = 'A'
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();
		while ($r = $q->fetch_object()) {
			$res []= $r;
		}

		return $res;
	}

	function method_getItemsRemito($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT remito_emi_detalle.id_remito_emi_detalle,
		remito_emi_detalle.id_producto_item,
		CONCAT(producto.descrip, ' ', color.descrip, ' ', producto_item.capacidad, unidad.descrip) as producto,
		remito_emi_detalle.cantidad,
		producto.iva,
		producto.desc_producto,
		fabrica.desc_fabrica,
		producto_item.id_producto_item,
		producto_item.precio_lista,
		producto_item.remarc_final,
		producto_item.desc_final,
		producto_item.bonif_final
		FROM remito_emi_detalle
		INNER JOIN producto_item USING(id_producto_item)
		INNER JOIN producto USING(id_producto)
		INNER JOIN fabrica USING(id_fabrica)
		INNER JOIN color USING(id_color)
		INNER JOIN unidad USING(id_unidad)
		WHERE id_remito_emi = '" . $p->id_remito_emi . "'
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();
		while ($r = $q->fetch_object()) {

			$plmasiva = $r->precio_lista + ($r->precio_lista * $r->iva / 100);

			$costo = $plmasiva;
			$costo = $costo - ($costo * $r->desc_fabrica / 100);
			$costo = $costo - ($costo * $r->desc_producto / 100);

			$pcf = $costo + ($costo * $r->remarc_final /100);
			$pcf = $pcf - (($pcf * $r->desc_final) / 100);

			$pcfcd = $pcf - (($pcf * $r->bonif_final) / 100);
			$p_si = $pcfcd;

// 			if ($p->interes) {
// 				$pcfcd = $pcfcd + ($pcfcd * $p->interes / 100);
// 			} else if ($p->interes_lista) {
// 				$pcfcd = $this->addInteresLista($pcfcd, $p->interes_lista);
// 			}
			$r->cantidad = (float) $r->cantidad;
			$r->unitario = (float) $pcfcd;
			$r->total = (float) ($r->cantidad * $pcfcd);

			$res []= $r;
		}

		return $res;
	}

	function method_getSucursales ($params, $error) {
		$p = $params[0];
		$db = $this->link2;

		$q = $db->query("
		SELECT
		id_sucursal as value,
		descrip as label
		FROM sucursal
		");

		$res = Array();
		while ($r = $q->fetch_object()) {
			$res []= $r;
		}

		return $res;
	}

	public function method_getPuntosVenta ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT * FROM impresora
		WHERE tipo = 'F'
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		while ($r = $q->fetch_object()) {
			$res []= $r;
		}

		return $res;
	}

	public function method_getDatosImpresora ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT * FROM impresora
		WHERE id_impresora = '" . $p->id_impresora . "'
		LIMIT 1
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		return $q->fetch_object();
	}

	public function method_getUsuariosCMB ($params, $error) {
		$q = $this->db->query("
        SELECT
		id_usuario as value,
		CONCAT(nro_vendedor, ' - ', nick) as label
		FROM usuario
		WHERE estado = 'A'
		");
		while ($r = $q->fetch_object()) {
			$res []= $r;
		}
		return $res;
	}

	public function method_nroVendedor ($params, $error) {
		$p = $params[0];
		$qUsuario = $this->db->query("
		SELECT
		usuario.*,
		configuraciones.*
		FROM usuario, configuraciones
		WHERE id_usuario = '" . $p->id_usuario . "'
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$rs = $qUsuario->fetch_object();
		return $rs;
	}

	public function method_getGastosCuentas ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT *
		FROM gastos_cuentas
		ORDER BY descrip
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = array();
		while ($r = $q->fetch_object()) {

		}

	}

	public function method_setPresupuesto ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		UPDATE presupuestos SET estado = 'P'
		WHERE id_presupuesto = '" . $p->id_presupuesto . "'
		LIMIT 1
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		return true;
	}

	public function method_getListaVentas ($params, $error) {
		$p = $params[0];

		switch ($p->tipoventa) {
			case 'V':
				$filtro = " AND presupuestos.estado = 'V' ";
			break;
			case 'P':
				$filtro = " AND presupuestos.estado = 'P' ";
			break;
			default:
				$filtro = "";
			break;
		}

		$q = $this->db->query("SELECT DISTINCT
		id_presupuesto,
		nro,
		cliente,
		CASE presupuestos.estado
			WHEN 'P' THEN 'Presupuesto'
			WHEN 'V' THEN 'Venta'
		END as estado,
		(SELECT COUNT(id_presupuestos_items) FROM presupuestos_items WHERE presupuestos_items.id_presupuesto = presupuestos.id_presupuesto) as items,
		usuario.id_usuario,
		usuario.nick,
		usuario.tipo
		FROM presupuestos
		INNER JOIN usuario USING(id_usuario)
		INNER JOIN presupuestos_items USING(id_presupuesto)
		WHERE fecha BETWEEN '" . date('Y-m-d') . "' AND '" . date('Y-m-d') . "'
		" . $filtro . "
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();

		while ($reg = $q->fetch_object()) {
			$res[] = $reg;
		}

		return $res;
	}

	public function method_getCtasCtes ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT
		ctas_ctes.id_cta_cte as value,
		CONCAT(clientes.dni_cuit, ' - ', trim(clientes.razon_social)) as label
		FROM ctas_ctes
		INNER JOIN clientes USING(id_cliente)
		INNER JOIN ctacte_sucursal ON clientes.tipodoc_dnicuit = ctacte_sucursal.tipodoc_dnicuit
		INNER JOIN paramet USING(id_sucursal)
		ORDER BY clientes.razon_social
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();

		while ($r = $q->fetch_object()) {
			$res[] = $r;
		}

		return $res;
	}
	public function method_getCtaCteInteres ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT
		id_cliente,
		IFNULL((SELECT interes_ctas FROM configuraciones), ctas_ctes.interes) as interes,
		limite_mensual,
		estado
		FROM ctas_ctes
		WHERE id_cta_cte = '" . $p->id_cta_cte . "'
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = $q->fetch_object();

		return $res;
	}


	public function method_getTarjetasCredito ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT id_tarjeta as value, nombre as label
		FROM tarjetas
		WHERE tipo = 'C'
		ORDER BY nombre
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();

		while ($reg = $q->fetch_object()) {
			$res []= $reg;
		}

		return $res;
	}

	public function method_getTarjetasCuotas ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT id_tarjeta_cuota as value, cuota as label
		FROM tarjetas_cuotas
		WHERE id_tarjeta = '" . $p->id_tarjeta . "'
		ORDER BY cuota
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();

		while ($reg = $q->fetch_object()) {
			$res []= $reg;
		}
		return $res;
	}

	public function method_getTarjetasIntereses ($params, $error) {
		$p = $params[0];

		if ($p->id_tarjeta_cuota) {
			$q = $this->db->query("
			SELECT tarjetas.porcentaje as tarjeta, tarjetas_cuotas.porcentaje as cuota
			FROM tarjetas_cuotas
			INNER JOIN tarjetas USING(id_tarjeta)
			WHERE tarjetas_cuotas.id_tarjeta = '" . $p->id_tarjeta . "'
			AND tarjetas_cuotas.id_tarjeta_cuota = '" . $p->id_tarjeta_cuota . "'
			");

			if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		} else {
			$q = $this->db->query("
			SELECT tarjetas.porcentaje as tarjeta
			FROM tarjetas
			WHERE tarjetas.id_tarjeta = '" . $p->id_tarjeta . "'
			");
			if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }
		}

		$res = $q->fetch_object();

		return $res;
	}
	public function method_getTarjetasDebito ($params, $error) {
		$p = $params[0];

		$q = $this->db->query("
		SELECT id_tarjeta as value, nombre as label
		FROM tarjetas
		WHERE tipo = 'D'
		ORDER BY nombre
		");

		if ($this->db->error) { $error->SetError(JsonRpcError_Unknown, (__FILE__ . " - " . (__LINE__ - 2) . ": " . $this->db->error)); return $error; }

		$res = Array();

		while ($reg = $q->fetch_object()) {
			$res[] = $reg;
		}

		return $res;
	}

}
?>
