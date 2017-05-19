qx.Class.define("elpintao.comp.pedidos.pagePedidosInt",
{
	extend : qx.ui.tabview.Page,
	construct : function ()
	{
	this.base(arguments);
	
	this.setLabel('Pedidos internos');
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
	

	var application = qx.core.Init.getApplication();
	var contexto = this;
	
	var functionCalcularTotales = function() {
		var rowDataAsMapDetalle, rowDataDetalle;
		var rowDataAsMapTotales, rowDataTotales;
		var bandera;
		
		tableModelTotales.setDataAsMapArray([{descrip: "P.lis.", total: 0}, {descrip: "P.lis.+IVA", total: 0}], true);
		
		for (var i = 0; i < tableModelDetalle.getRowCount(); i++) {
			rowDataAsMapDetalle = tableModelDetalle.getRowDataAsMap(i);
			rowDataDetalle = tableModelDetalle.getRowData(i);
			
			rowDataAsMapTotales = tableModelTotales.getRowDataAsMap(0);
			tableModelTotales.setValueById("total", 0, rowDataAsMapTotales.total + rowDataAsMapDetalle.precio_lista);
			rowDataAsMapTotales = tableModelTotales.getRowDataAsMap(1);
			tableModelTotales.setValueById("total", 1, rowDataAsMapTotales.total + rowDataAsMapDetalle.plmasiva);
			bandera = true;
			for (var x = 2; x < tableModelTotales.getRowCount(); x++) {
				rowDataAsMapTotales = tableModelTotales.getRowDataAsMap(x);
				rowDataTotales = tableModelTotales.getRowData(x);
				if (rowDataDetalle.id_unidad == rowDataTotales.id_unidad) {
					tableModelTotales.setValueById("total", x, tableModelTotales.getValueById("total", x) + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad));
					bandera = false;
					break;
				}
			}
			if (bandera) {
				tableModelTotales.addRowsAsMapArray([{id_unidad: rowDataDetalle.id_unidad, descrip: rowDataAsMapDetalle.unidad, total: rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad}], null, true);
			}
		}
	}

	//Menu de contexto Pedido
	
	var commandNuevoPedido = new qx.ui.command.Command("Insert");
	commandNuevoPedido.addListener("execute", function(){
		var win = new elpintao.comp.pedidos.windowPedInt();
		win.addListener("aceptado", function(e){
			var p = {};
			p.id_fabrica = win.slbFabrica.getModelSelection().getItem(0).get("id_fabrica");
			p.detalle = win.tableModelDetalle.getDataAsMapArray();

			var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosInt");
			try {
				var resultado = rpc.callSync("alta_pedido", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			tableModelPedido.setDataAsMapArray(resultado, true, true)
			if (tableModelPedido.getRowCount() > 0) tblPedido.setFocusedCell(1, 0, true);
			tblPedido.focus();
			
			application.functionTransmitir();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var menutblPedido = new componente.general.ramon.ui.menu.Menu();
	var btnNuevoPedido = new qx.ui.menu.Button("Nuevo pedido...", null, commandNuevoPedido); 
	var btnImprimir = new qx.ui.menu.Button("Imprimir");
	btnImprimir.setEnabled(false);
	btnImprimir.addListener("execute", function(e){
		var rowData = tableModelPedido.getRowData(tblPedido.getFocusedRow());
		window.open("services/class/comp/Impresion.php?rutina=imprimir_pedido_interno&tipo=sucursal&id=" + rowData.id_pedido_int);
	});
	
	menutblPedido.add(btnNuevoPedido);
	menutblPedido.addSeparator();
	menutblPedido.add(btnImprimir);
	menutblPedido.memorizar();
	commandNuevoPedido.setEnabled(false);

		
	
	//Tabla

	var tableModelPedido = new qx.ui.table.model.Simple();
	tableModelPedido.setColumns(["Fecha", "Fábrica", "Estado"], ["fecha", "fabrica", "estado"]);
	//tableModelPedido.setColumns(["Fecha", "Fábrica"], ["fecha", "id_fabrica"]);
	//tableModelPedido.setEditable(true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblPedido = new componente.general.ramon.ui.table.Table(tableModelPedido, custom);
	
	tblPedido.setShowCellFocusIndicator(false);
	tblPedido.toggleColumnVisibilityButtonVisible();
	tblPedido.toggleStatusBarVisible();
	
	
	var tableColumnModelPedido = tblPedido.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	
	var resizeBehavior = tableColumnModelPedido.getBehavior();
	resizeBehavior.set(0, {width:"40%", minWidth:100});
	resizeBehavior.set(1, {width:"40%", minWidth:100});
	resizeBehavior.set(2, {width:"20%", minWidth:100});
	
	var cellrendererReplace = new qx.ui.table.cellrenderer.Replace();
	cellrendererReplace.setReplaceMap({
		"E" : "Enviado",
		"R" : "Respondido",
		"A" : "Anulado"
	});
	tableColumnModelPedido.setDataCellRenderer(2, cellrendererReplace);


	var selectionModelPedido = tblPedido.getSelectionModel();
	selectionModelPedido.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelPedido.addListener("changeSelection", function(e){
		if (! selectionModelPedido.isSelectionEmpty()) {
			btnImprimir.setEnabled(true);
			menutblPedido.memorizar([btnImprimir]);
			
			tblTotales.setFocusedCell();
			tblDetalle.setFocusedCell();
			tblInforma.setFocusedCell();
			var rowData = tableModelPedido.getRowData(tblPedido.getFocusedRow());
			
			var p = {};
			p.id_pedido_int = rowData.id_pedido_int;
			
			var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosInt");
			rpc.callAsync(function(resultado, error, id){
				tableModelInforma.setDataAsMapArray(resultado.remitos, true);
				tableModelDetalle.setDataAsMapArray(resultado.detalle, true);
				functionCalcularTotales();	
			}, "leer_detalle", p);
		}
	});

	tblPedido.setContextMenu(menutblPedido);
	

	this.add(tblPedido, {left:0 , top: 20, right: "77%", bottom: "30%"});
	
	this.add(new qx.ui.basic.Label("Pedidos:"), {left:0 , top: 0});
	


	
	
	

	//Tabla

	var tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "P.lis.", "P.lis.+IVA", "Cantidad"], ["fabrica", "producto", "capacidad", "unidad", "color", "precio_lista", "plmasiva", "cantidad"]);
	tableModelDetalle.addListener("dataChanged", function(e){
		var rowCount = tableModelDetalle.getRowCount();
		if (rowCount > 0) tblDetalle.setAdditionalStatusBarText(rowCount + " item/s"); else tblDetalle.setAdditionalStatusBarText(" ");
	});
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalle = new componente.general.ramon.ui.table.Table(tableModelDetalle, custom);
	tblDetalle.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(false);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	//tblDetalle.toggleStatusBarVisible();
	tblDetalle.setAdditionalStatusBarText(" ");
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	

	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"8%", minWidth:100});
		resizeBehavior.set(1, {width:"41%", minWidth:100});
		resizeBehavior.set(2, {width:"8%", minWidth:100});
		resizeBehavior.set(3, {width:"3%", minWidth:100});
		resizeBehavior.set(4, {width:"14%", minWidth:100});
		resizeBehavior.set(5, {width:"7%", minWidth:100});
		resizeBehavior.set(6, {width:"9%", minWidth:100});
		resizeBehavior.set(7, {width:"8%", minWidth:100});

		
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();

	
	
	this.add(tblDetalle, {left:"23.5%", top: 20, right: 0, bottom: "30%"});
	
	//this.add(tblPedido, {left:0 , top: 20, right: 0, height: "40%"});
	
	this.add(new qx.ui.basic.Label("Detalle:"), {left: "25.5%", top: 0});
	

	//Tabla

	var tableModelTotales = new qx.ui.table.model.Simple();
	tableModelTotales.setColumns(["", "Total"], ["descrip", "total"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblTotales = new componente.general.ramon.ui.table.Table(tableModelTotales, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblTotales.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblTotales.setShowCellFocusIndicator(false);
	tblTotales.toggleColumnVisibilityButtonVisible();
	tblTotales.toggleStatusBarVisible();
	
	this.add(tblTotales, {left: 0, top: "71%", right: "77%", bottom: 0});
	
	
	
	
	//Tabla

	var tableModelInforma = new qx.ui.table.model.Simple();
	tableModelInforma.setColumns(["Sucursal", "Nro.remito", "Transporta", "Autoriza"], ["sucursal", "nro_remito", "transporta", "autoriza"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblInforma = new componente.general.ramon.ui.table.Table(tableModelInforma, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblInforma.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblInforma.setShowCellFocusIndicator(false);
	tblInforma.toggleColumnVisibilityButtonVisible();
	tblInforma.toggleStatusBarVisible();
	
	this.add(tblInforma, {left: "23.5%", top: "71%", right: "30%", bottom: 0});
	

	
	
	var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosInt");
	try {
		var resultado = rpc.callSync("leer_pedido");
	} catch (ex) {
		alert("Sync exception: " + ex);
	}

	tableModelPedido.setDataAsMapArray(resultado, true, true)
	//if (tableModelPedido.getRowCount() > 0) tblPedido.setFocusedCell(1, 0, true);

	this.addListenerOnce("appear", function(e){
		tblPedido.focus();
	});
	
	},
	members : 
	{

	}
});