qx.Class.define("elpintao.comp.pedidos.windowPedInt",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
	this.base(arguments);
	
	this.set({
		caption: "Nuevo pedido interno",
		width: 1000,
		height: 470,
		showMinimize: false,
		showMaximize: false
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		slbFabrica.focus();
	});
	
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
					tableModelTotales.setValueById("total", x, tableModelTotales.getValueById("total", x) + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad))
					bandera = false;
					break;
				}
			}
			if (bandera) {
				tableModelTotales.addRowsAsMapArray([{id_unidad: rowDataDetalle.id_unidad, descrip: rowDataAsMapDetalle.unidad, total: rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad}], null, true);
			}
		}
	}
	

	var menuFabrica = new componente.general.ramon.ui.menu.Menu();
	var btnABMFabrica = new qx.ui.menu.Button("ABM fábricas...");
	btnABMFabrica.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.parametros.windowFabricas();
		win.addListener("disappear", function(e){slbFabrica.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();	
	});
	menuFabrica.add(btnABMFabrica);
	menuFabrica.memorizar();
	btnABMFabrica.setEnabled(false);
	var slbFabrica = this.slbFabrica = new componente.general.ramon.ui.selectbox.SelectBox();
	slbFabrica.setContextMenu(menuFabrica);
	var controllerFabrica = new qx.data.controller.List(null, slbFabrica, "descrip");
	application.objFabrica.store.bind("model", controllerFabrica, "model");
	this.add(slbFabrica, {left: 50, top: 0});
	slbFabrica.addListener("changeSelection", function(e){
		
	});
	this.add(new qx.ui.basic.Label("Fábrica:"), {left: 0, top: 3});
	
	var aux = slbFabrica.getChildren();
	for (var i in aux) {
		if (aux[i].getModel().get("id_fabrica")=="1") {
			slbFabrica.setSelection([aux[i]]);
			break;
		}
	}


	
	//Menu de contexto Detalle
	
	var commandNuevoDetalle = new qx.ui.command.Command("Insert");
	commandNuevoDetalle.addListener("execute", function(){
		windowProducto.id_fabrica = slbFabrica.getModelSelection().getItem(0).get("id_fabrica");
		windowProducto.center();
		windowProducto.open();
	});
	
	var menutblDetalle = new componente.general.ramon.ui.menu.Menu();
	var btnNuevoDetalle = new qx.ui.menu.Button("Alta item...", null, commandNuevoDetalle); 
	var btnEliminarDetalle = new qx.ui.menu.Button("Eliminar item");
	btnEliminarDetalle.setEnabled(false);
	btnEliminarDetalle.addListener("execute", function(e){
		tableModelDetalle.removeRows(tblDetalle.getFocusedRow(), 1);
		functionCalcularTotales();
		tblDetalle.focus();
	});
	menutblDetalle.add(btnNuevoDetalle);
	menutblDetalle.addSeparator();
	menutblDetalle.add(btnEliminarDetalle);
	menutblDetalle.memorizar();
	commandNuevoDetalle.setEnabled(false);
	

	//Tabla

	var tableModelDetalle = this.tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "P.lis.", "P.lis.+IVA", "Cantidad"], ["fabrica", "producto", "capacidad", "unidad", "color", "precio_lista", "plmasiva", "cantidad"]);
	//tableModelDetalle.getDataAsMapArray()
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
		resizeBehavior.set(0, {width:"7%", minWidth:100});
		resizeBehavior.set(1, {width:"47%", minWidth:100});
		resizeBehavior.set(2, {width:"7%", minWidth:100});
		resizeBehavior.set(3, {width:"3%", minWidth:100});
		resizeBehavior.set(4, {width:"11%", minWidth:100});
		resizeBehavior.set(5, {width:"7%", minWidth:100});
		resizeBehavior.set(6, {width:"8%", minWidth:100});
		resizeBehavior.set(7, {width:"7%", minWidth:100});
		
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"36.7%", minWidth:100});
		resizeBehavior.set(2, {width:"6.7%", minWidth:100});
		resizeBehavior.set(3, {width:"2.7%", minWidth:100});
		resizeBehavior.set(4, {width:"15.7%", minWidth:100});
		resizeBehavior.set(5, {width:"7.7%", minWidth:100});
		resizeBehavior.set(6, {width:"7.7%", minWidth:100});
		resizeBehavior.set(7, {width:"5.3%", minWidth:100});

		
	tblDetalle.setContextMenu(menutblDetalle);
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	selectionModelDetalle.addListener("changeSelection", function(e){
		btnEliminarDetalle.setEnabled(! selectionModelDetalle.isSelectionEmpty());
		menutblDetalle.memorizar([btnEliminarDetalle]);
	});
	
	
	this.add(tblDetalle, {left:0, top: 30, right: "15.5%", bottom: 30});
	
	//this.add(tblPedido, {left:0 , top: 20, right: 0, height: "40%"});
	
	//this.add(new qx.ui.basic.Label("Detalle:"), {left: 0, top: "47%"});


	
	//Tabla

	var tableModelTotales = new qx.ui.table.model.Simple();
	tableModelTotales.setColumns(["", "Total"], ["descrip", "total"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblTotales = new componente.general.ramon.ui.table.Table(tableModelTotales, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblTotales.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblTotales.setShowCellFocusIndicator(false);
	tblTotales.toggleColumnVisibilityButtonVisible();
	tblTotales.toggleStatusBarVisible();
	
	this.add(tblTotales, {left: "85%", top: 30, right: 0, bottom: 30});

	
	var windowProducto = new elpintao.comp.pedidos.windowProducto("Alta de items detalle");
	
	windowProducto.addListener("aceptado", function(e){
		var tableModel = e.getData();
	
		tblDetalle.resetSelection();
		
		var rowData;
		var rowBuscado;
		for (var x = 0; x < tableModel.getRowCount(); x++) {
			rowData = tableModel.getRowData(x);
			if (rowData.cantidad > 0) {
				rowBuscado = tblDetalle.buscar("id_producto_item", rowData.id_producto_item, true, 6);
				if (rowBuscado == null) {
					//p.detalle.push(rowData);
					tableModelDetalle.addRowsAsMapArray([rowData], null, true);
				} else {
					rowBuscado.cantidad = rowBuscado.cantidad + rowData.cantidad;
					tableModelDetalle.setValueById("cantidad", tblDetalle.getFocusedRow(), rowBuscado.cantidad);
				}
			}
		}
		
		tblDetalle.focus();
		functionCalcularTotales();
		//commandEditarDetalle.fireDataEvent("execute", null);
	}, this);
	
	windowProducto.addListener("disappear", function(e){
		tblDetalle.focus();
	});
	
	windowProducto.setModal(true);
	application.getRoot().add(windowProducto);
	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		this.fireDataEvent("aceptado");
		btnCancelar.fireEvent("execute");
	}, this);
	this.add(btnAceptar, {left: 170, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 370, bottom: 0})
	
	
	slbFabrica.setTabIndex(1);
	tblDetalle.setTabIndex(2);
	tblTotales.setTabIndex(3);
	btnAceptar.setTabIndex(4);
	btnCancelar.setTabIndex(5);

	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});