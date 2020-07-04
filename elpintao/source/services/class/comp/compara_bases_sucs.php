<?php

?>

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<title>Compara Bases Sucs</title>
</head>
<body>
<table border="1" cellpadding="5" cellspacing="0" width="800" align="center">

<?php

try {

$aux = new mysqli_driver;
//$aux->report_mode = MYSQLI_REPORT_ERROR;
$aux->report_mode = MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT;

set_time_limit(0);

require_once("Conexion.php");


$urlsql = $conexion->servidor;
$port = null;
$pos = strpos($urlsql, ":");
if ($pos !== false && $pos >= 0) {
	$port = (int) substr($urlsql, $pos + 1);
	$urlsql = substr($urlsql, 0, $pos);
}

$mysqli_01 = @mysqli_connect($urlsql, $conexion->usuario, $conexion->password, $conexion->database, $port);

$sql = "SELECT * FROM paramet";
$rsParamet = $mysqli_01->query($sql);
$rowParamet = $rsParamet->fetch_object();

$tables_in_01 = "Tables_in_" . $conexion->database;

$tables = array();
$sql = "SHOW FULL TABLES";
$rs_01 = $mysqli_01->query($sql);
while ($row_01 = $rs_01->fetch_object()) {
	$tables[] = $row_01;
}

$sql = "SELECT * FROM sucursal WHERE activo AND id_sucursal <> " . $rowParamet->id_sucursal;
$rsSucursal_01 = $mysqli_01->query($sql);
while ($rowSucursal_01 = $rsSucursal_01->fetch_object()) {
	$tables_in_02 = "Tables_in_" . $rowSucursal_01->base;
	
	$urlsql = $rowSucursal_01->urlsql;
	$port = null;
	$pos = strpos($urlsql, ":");
	if ($pos !== false && $pos >= 0) {
		$port = (int) substr($urlsql, $pos + 1);
		$urlsql = substr($urlsql, 0, $pos);
	}
	
	$mysqli_02 = @mysqli_connect($urlsql, $rowSucursal_01->username, $rowSucursal_01->password, $rowSucursal_01->base, $port);
	if ($mysqli_02) {
		?>
		<tr><td>sucursal <?php echo $rowSucursal_01->descrip; ?> conectada</td></tr>
		<?php
		
		foreach ($tables as $rowTable_01) {
			
			$sql = "SHOW FULL TABLES LIKE '" . $rowTable_01->{$tables_in_01} . "'";
			$rsTable_02 = $mysqli_02->query($sql);
			if ($rsTable_02->num_rows > 0) {
				$rowTable_02 = $rsTable_02->fetch_object();
				
				if ($rowTable_01->Table_type == $rowTable_02->Table_type) {
					$sql = "SHOW FULL COLUMNS FROM `" . $rowTable_01->{$tables_in_01} . "`";
					$rsColumns_01 = $mysqli_01->query($sql);
					$rsColumns_02 = $mysqli_02->query($sql);
					if ($rsColumns_01->num_rows == $rsColumns_02->num_rows) {
						while ($rowColumns_01 = $rsColumns_01->fetch_object()) {
							$sql = "SHOW FULL COLUMNS FROM `" . $rowTable_01->{$tables_in_01} . "` LIKE '" . $rowColumns_01->Field . "'";
							$rsColumns_02 = $mysqli_02->query($sql);
							if ($rsColumns_02->num_rows > 0) {
								$rowColumns_02 = $rsColumns_02->fetch_object();
								if($rowColumns_01->Type == $rowColumns_02->Type) {
									
								} else {
									?>
									<tr><td>&nbsp;</td><td>tabla <?php echo $rowTable_01->{$tables_in_01}; ?></td><td>DISTINTO TIPO CAMPO <?php echo $rowColumns_01->Field; ?></td></tr>
									<?php
								}
							} else {
								?>
								<tr><td>&nbsp;</td><td>tabla <?php echo $rowTable_01->{$tables_in_01}; ?></td><td>NO EXISTE CAMPO <?php echo $rowColumns_01->Field; ?></td></tr>
								<?php
							}
						}
					} else {
						?>
						<tr><td>&nbsp;</td><td>tabla <?php echo $rowTable_01->{$tables_in_01}; ?></td><td>DISTINTO NUMERO DE CAMPOS</td></tr>
						<?php
					}
				} else {
					?>
					<tr><td>&nbsp;</td><td>tabla <?php echo $rowTable_01->{$tables_in_01}; ?> NO ES DEL MISMO TIPO</td></tr>
					<?php
				}
			} else {
				?>
				<tr><td>&nbsp;</td><td>tabla <?php echo $rowTable_01->{$tables_in_01}; ?> NO EXISTE</td></tr>
				<?php
			}
		}
	} else {
		?>
		<tr><td>sucursal <?php echo $rowSucursal_01->descrip; ?> NO CONECTA</td></tr>
		<?php
	}
}

?>
</table>
<?php

} catch (Exception $e) {
	echo "<br/><br/>" . $e->getLine() . "<br/><br/>" . $e->getMessage() . "<br/><br/>" . $mysqli_02->error . "<br/><br/>" . $sql;
} 

?>