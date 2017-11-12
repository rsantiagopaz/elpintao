qx.Class.define("elpintao.comp.productos.pageHistoricoProducto",
{
	extend : qx.ui.tabview.Page,
	construct : function (emitir)
	{
		this.base(arguments);
		
		
		
		
	this.setLabel("Historico producto");
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		dtfDesde.focus();
		btnBuscar.execute();
	});
	


	var application = qx.core.Init.getApplication();
	var rowDataRemito = null;
	
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	
		
		
	
	var layout = new qx.ui.layout.Grid(6, 6);
    for (var i = 0; i < 15; i++) {
    	layout.setColumnAlign(i, "left", "middle");
    }
    layout.setRowHeight(0, 24);
    
	var composite = new qx.ui.container.Composite(layout);
	
	
	//composite.add(new qx.ui.basic.Label("Tipo:"), {row: 0, column: 0});
	
	var slbTipo = new qx.ui.form.SelectBox();
	slbTipo.setWidth(90);
	slbTipo.add(new qx.ui.form.ListItem("-", null, ""));
	slbTipo.add(new qx.ui.form.ListItem("Alta", null, "Alta"));
	slbTipo.add(new qx.ui.form.ListItem("Modificar", null, "Modificar"));
	slbTipo.add(new qx.ui.form.ListItem("Eliminar", null, "Eliminar"));
	//composite.add(slbTipo, {row: 0, column: 1});
	
	
	
	var aux = new Date;
	var dtfDesde = this.dtfDesde = new qx.ui.form.DateField();
	dtfDesde.setWidth(90);
	var dtfHasta = this.dtfHasta = new qx.ui.form.DateField();
	dtfHasta.setWidth(90);
	dtfHasta.setValue(aux);
	aux.setMonth(aux.getMonth() - 1);
	dtfDesde.setValue(aux);
	
	composite.add(new qx.ui.basic.Label("Desde:"), {row: 0, column: 3});
	composite.add(dtfDesde, {row: 0, column: 4});
	composite.add(new qx.ui.basic.Label("Hasta:"), {row: 0, column: 5});
	composite.add(dtfHasta, {row: 0, column: 6});
	
	
	
	
	var rpc = new qx.io.remote.Rpc("services/", "comp.Reparacion");
	try {
		var resultado = rpc.callSync("autocompletarFabrica", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var slbFabrica = this.slbFabrica = new qx.ui.form.SelectBox();
	slbFabrica.setWidth(200);
	
	slbFabrica.add(new qx.ui.form.ListItem("-", null, "0"));
	for (var x in resultado) {
		slbFabrica.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	
	composite.add(new qx.ui.basic.Label("Fábrica:"), {row: 0, column: 11});
	composite.add(slbFabrica, {row: 0, column: 12});
	
	

	var txtBuscar = this.txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setWidth(300);
	txtBuscar.setLiveUpdate(true);

	//composite.add(new qx.ui.basic.Label("Producto:"), {row: 0, column: 14});
	//composite.add(txtBuscar, {row: 0, column: 15});
	
	
	var btnBuscar = new qx.ui.form.Button("Buscar");
	btnBuscar.addListener("execute", function(e){
		tableModelProducto.setDataAsMapArray([], true);
		tblProducto.setFocusedCell();
		
		tableModelItem.setDataAsMapArray([], true);
		tblItem.setFocusedCell();
		
		var p = {};
		p.desde = dtfDesde.getValue();
		p.hasta = dtfHasta.getValue();
		p.id_fabrica = slbFabrica.getModelSelection().getItem(0);
		p.buscar = txtBuscar.getValue().trim();
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Historico_producto");
		rpc.callAsync(function(resultado, error, id) {

			tableModelProducto.setDataAsMapArray(resultado, true);

		}, "leer_historico_producto", p);
	});
	composite.add(btnBuscar, {row: 0, column: 16});
	
	this.add(composite, {left: 0, top: 0});
	
		
	
	
		
		

		
		
		
		
	//Tabla

	var tableModelProducto = new qx.ui.table.model.Simple();
	tableModelProducto.setColumns(["Fecha", "Usuario", "Procedimiento", "Fábrica", "Descripción", "Desc. tk.", "Moneda"], ["fecha", "nick", "log_descrip", "fabrica_descrip", "descrip", "descrip_ticket", "moneda_descrip"]);
	tableModelProducto.setColumnSortable(0, false);
	tableModelProducto.setColumnSortable(1, false);
	tableModelProducto.setColumnSortable(2, false);
	tableModelProducto.setColumnSortable(3, false);
	tableModelProducto.setColumnSortable(4, false);
	tableModelProducto.setColumnSortable(5, false);
	tableModelProducto.addListener("dataChanged", function(e){
		var rowCount = tableModelProducto.getRowCount();
		if (rowCount > 0) tblProducto.setAdditionalStatusBarText(rowCount + " item/s"); else tblProducto.setAdditionalStatusBarText(" ");
	});
	
	//tableModelProducto.setEditable(true);
	//tableModelProducto.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblProducto = new componente.general.ramon.ui.table.Table(tableModelProducto, custom);
	tblProducto.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblProducto.toggleColumnVisibilityButtonVisible();
	tblProducto.setShowCellFocusIndicator(false);
	tblProducto.toggleColumnVisibilityButtonVisible();
	//tblProducto.toggleStatusBarVisible();
	
	var tableColumnModelProducto = tblProducto.getTableColumnModel();
	//tableColumnModelProducto.setColumnVisible(7, false);
	
	var cellrendererDate = new qx.ui.table.cellrenderer.Date();
	cellrendererDate.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss"));
	tableColumnModelProducto.setDataCellRenderer(0, cellrendererDate);
	
	var cellrendererReplace = new qx.ui.table.cellrenderer.Replace();
	cellrendererReplace.setReplaceMap({
		"Alta producto" : "Alta",
		"Modificar producto" : "Modificar",
		"Eliminar producto"  : "Eliminar"
	});
	tableColumnModelProducto.setDataCellRenderer(2, cellrendererReplace);
	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelProducto.getBehavior();
		//resizeBehavior.set(0, {width:"9%", minWidth:100});
		//resizeBehavior.set(1, {width:"8%", minWidth:100});
		//resizeBehavior.set(2, {width:"13%", minWidth:100});
		//resizeBehavior.set(3, {width:"39%", minWidth:100});
		//resizeBehavior.set(4, {width:"7%", minWidth:100});
		//resizeBehavior.set(5, {width:"3%", minWidth:100});
		//resizeBehavior.set(6, {width:"15%", minWidth:100});
		//resizeBehavior.set(7, {width:"6%", minWidth:100});

		
	
	var selectionModelProducto = tblProducto.getSelectionModel();
	selectionModelProducto.addListener("changeSelection", function(e){
		if (! selectionModelProducto.isSelectionEmpty()) {
			var focusedRow = tblProducto.getFocusedRow();
			var rowData = tableModelProducto.getRowDataAsMap(focusedRow);
			
			tblItem.setFocusedCell();
			
			var p = {};
			p.id_producto = rowData.id_producto;

			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Historico_producto");
			rpc.callAsync(function(resultado, error, id) {
				
				//alert(qx.lang.Json.stringify(resultado, null, 2));
				//alert(qx.lang.Json.stringify(error, null, 2));
				
				tableModelItem.setDataAsMapArray(resultado, true);
				
			}, "leer_historico_producto_item", p);
		}
	});
	
	this.add(tblProducto, {left: 0, top: 30, right: "15.3%", bottom: "52%"});
	
	
	
	
	
	
	
	
	
	//Tabla

	var tableModelItem = new qx.ui.table.model.Simple();
	tableModelItem.setColumns(["Fecha", "Usuario", "Procedimiento", "Capacidad", "Color", "Unidad", "Cod.interno", "Cod.externo", "Cod.barra", "Duración"], ["fecha", "nick", "log_descrip", "capacidad", "color_descrip", "unidad_descrip", "cod_interno", "cod_externo", "cod_barra", "duracion"]);
	tableModelItem.setColumnSortable(0, false);
	tableModelItem.setColumnSortable(1, false);
	tableModelItem.setColumnSortable(2, false);
	tableModelItem.setColumnSortable(3, false);
	tableModelItem.setColumnSortable(4, false);
	tableModelItem.setColumnSortable(5, false);
	tableModelItem.setColumnSortable(6, false);
	tableModelItem.addListener("dataChanged", function(e){
		var rowCount = tableModelItem.getRowCount();
		if (rowCount > 0) tblItem.setAdditionalStatusBarText(rowCount + " item/s"); else tblItem.setAdditionalStatusBarText(" ");
	});
	
	//tableModelProducto.setEditable(true);
	//tableModelProducto.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblItem = new componente.general.ramon.ui.table.Table(tableModelItem, custom);
	tblItem.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblProducto.toggleColumnVisibilityButtonVisible();
	tblItem.setShowCellFocusIndicator(false);
	tblItem.toggleColumnVisibilityButtonVisible();
	//tblProducto.toggleStatusBarVisible();
	
	var tableColumnModelItem = tblItem.getTableColumnModel();
	//tableColumnModelProducto.setColumnVisible(7, false);
	
	var celleditorDate = new qx.ui.table.cellrenderer.Date();
	celleditorDate.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss"));
	tableColumnModelItem.setDataCellRenderer(0, celleditorDate);
	
	var cellrendererReplace = new qx.ui.table.cellrenderer.Replace();
	cellrendererReplace.setReplaceMap({
		"Alta producto_item" : "Alta",
		"Modificar producto_item" : "Modificar",
		"Eliminar producto_item"  : "Eliminar"
	});
	tableColumnModelItem.setDataCellRenderer(2, cellrendererReplace);
	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelItem.getBehavior();
		//resizeBehavior.set(0, {width:"9%", minWidth:100});
		//resizeBehavior.set(1, {width:"8%", minWidth:100});
		//resizeBehavior.set(2, {width:"13%", minWidth:100});
		//resizeBehavior.set(3, {width:"39%", minWidth:100});
		//resizeBehavior.set(4, {width:"7%", minWidth:100});
		//resizeBehavior.set(5, {width:"3%", minWidth:100});
		//resizeBehavior.set(6, {width:"15%", minWidth:100});
		//resizeBehavior.set(7, {width:"6%", minWidth:100});

		
	
	var selectionModelItem = tblItem.getSelectionModel();
	
	this.add(tblItem, {left: 0, top: "52%", right: "15.3%", bottom: 0});
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	
	

	
	
	dtfDesde.setTabIndex(2);
	dtfHasta.setTabIndex(3);
	slbFabrica.setTabIndex(5);
	txtBuscar.setTabIndex(6);
	btnBuscar.setTabIndex(7);
	tblProducto.setTabIndex(8);
	
	
	
	
		
	},
	members : 
	{

	}
});