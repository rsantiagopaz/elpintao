<?php
require("../services/class/comp/Conexion.php");
// $link = mysql_connect("$servidor", "$usuario", "$password");
// mysql_select_db("$base", $link);
// mysql_query("SET NAMES 'utf8'");
$db = new mysqli($conexion->servidor, $conexion->usuario, $conexion->password, $conexion->database);
$db->query("SET NAMES 'utf8'");

$q = $db->query("SELECT * FROM configuraciones LIMIT 1");
$config = $q->fetch_object();
$q = $db->query("SELECT * FROM paramet LIMIT 1");
$paramet = $q->fetch_object();
?>
<table cellpadding="5" cellspacing="0" width="700px" border="1" >
<tr align="center">
	<td>
	<table width="100%" border="0">
	<tr>
		<td width="10%">
			<table width="100%" border="0" style="font-size:14; font-weight: bold;" align="center">
				<tr>
				<td rowspan="3"><img src="logo.png" border="0" height="80" width="90"><br /><b>El Pintao</b></td>
				</tr>
				<!--
				<tr style="font-size:8; font-weight:normal;"><td>Dirección: Rivadavia Nº 1018</td></tr>
				<tr style="font-size:8; font-weight:normal;"><td>Tel: 0385 421-8866/ 0385 424-1917</td></tr>
				 -->
			</table>
			</td>
		<td width="53%" align="center"><input type="button" value="Imprimir" onclick="window.print()" /><table align="center" cellpadding="5" border="1"><tr><td align="center">MUESTREO DE STOCK<br /></td></tr></table></td>
		<td width="33%" align="right"><?php echo date("d/m/Y") . " - " . date("H:i:s"); ?></td>
	</tr>
	<tr><td colspan="3"><hr></td></tr>
	<tr style="font-size:10;">
		<td><u>Cantidad</u></td>
		<td colspan="2"><u>Producto</u></td>
	</tr>
    <tr><td colspan="3"><hr></td></tr>
    <?php
    $q = $db->query("
    SELECT 
    producto_item.id_producto_item, 
    fabrica.descrip as fabrica,
    producto.descrip as producto,
    color.descrip as color,
    producto_item.capacidad,
    unidad.descrip as unidad,
    stock.stock
    FROM stock
    INNER JOIN paramet USING(id_sucursal)
    INNER JOIN producto_item USING(id_producto_item)
    INNER JOIN producto USING(id_producto)
    INNER JOIN unidad USING(id_unidad)
    INNER JOIN color USING(id_color)
    INNER JOIN fabrica USING(id_fabrica)
    ORDER BY RAND()
    LIMIT 10
    ");
    while ($r = $q->fetch_object()) {
        if (substr($r->capacidad, -3) == 0) {
            $r->capacidad = (int) $r->capacidad;
        } else {
            $r->capacidad = number_format($r->capacidad, '2', ',', '.');
        }
        ?>
        <tr style="font-size: 10;">
            <td><?php echo $r->stock; ?>&nbsp;</td>
            <td colspan="2"><?php echo $r->fabrica . " - " . $r->producto . " - " . $r->color . " " . $r->capacidad . $r->unidad; ?>&nbsp;</td>
        </tr>
        <?php
    }
    ?>
    
    <?php
    ?>
    </table>        
    </td>
    </tr>
</table>