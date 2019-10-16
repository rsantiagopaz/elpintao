qx.Class.define("elpintao.comp.varios.pageVales",
{
	extend : qx.ui.tabview.Page,
	construct : function ()
	{
		this.base(arguments);
		
		
		
		
	this.setLabel("Vales de Mercadería");
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		dtfDesde.focus();
		btnBuscar.execute();
	});
	


	var application = qx.core.Init.getApplication();
	
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	
		
		
	
	var layout = new qx.ui.layout.Grid(6, 6);
    for (var i = 0; i < 15; i++) {
    	layout.setColumnAlign(i, "left", "middle");
    }
    layout.setRowHeight(0, 24);
    
	var composite = new qx.ui.container.Composite(layout);
	
	
	
	var aux = new Date;
	var dtfDesde = this.dtfDesde = new qx.ui.form.DateField();
	dtfDesde.setWidth(90);
	dtfDesde.setValue(aux);
	
	composite.add(new qx.ui.basic.Label("Fecha:"), {row: 0, column: 3});
	composite.add(dtfDesde, {row: 0, column: 4});
	
	
	var btnBuscar = new qx.ui.form.Button("Buscar");
	btnBuscar.addListener("execute", function(e){
		tableModelProducto.setDataAsMapArray([], true);
		tblProducto.setFocusedCell();
		
		tableModelDetalle.setDataAsMapArray([], true);
		tblDetalle.setFocusedCell();
		
		var p = {};
		p.desde = dtfDesde.getValue();
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Vales");
		rpc.callAsync(function(resultado, error, id) {
			
			//alert(qx.lang.Json.stringify(resultado, null, 2));

			tableModelProducto.setDataAsMapArray(resultado, true);

		}, "leer_vales", p);
	});
	composite.add(btnBuscar, {row: 0, column: 6});
	
	this.add(composite, {left: 0, top: 0});
	
		
	
	
		
		

		
		
		
		
	//Tabla

	var tableModelProducto = new qx.ui.table.model.Simple();
	tableModelProducto.setColumns(["Nro.Vale", "Factura", "Cliente", "Donde retira", "Fecha", "Estado"], ["nro_vale", "factura", "cliente", "sucursal_descrip", "fyh", "estado"]);
	tableModelProducto.setColumnSortable(0, false);
	tableModelProducto.setColumnSortable(1, false);
	tableModelProducto.setColumnSortable(2, false);
	tableModelProducto.setColumnSortable(3, false);
	tableModelProducto.setColumnSortable(4, false);
	tableModelProducto.setColumnSortable(5, false);
	tableModelProducto.addListener("dataChanged", function(e){
		var rowCount = tableModelProducto.getRowCount();
		
		tblProducto.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
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
	tableColumnModelProducto.setDataCellRenderer(4, cellrendererDate);
	
	var cellrendererReplace = new qx.ui.table.cellrenderer.Replace();
	cellrendererReplace.setReplaceMap({
		"A" : "Pendiente",
		"E" : "Emitido",
		"T"  : "Entregado"
	});
	tableColumnModelProducto.setDataCellRenderer(5, cellrendererReplace);
	


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
			
			tblDetalle.setFocusedCell();
			
			var p = {};
			p.id_valemercaderia = rowData.id_valemercaderia;

			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Vales");
			rpc.callAsync(function(resultado, error, id) {
				
				//alert(qx.lang.Json.stringify(resultado, null, 2));
				//alert(qx.lang.Json.stringify(error, null, 2));
				
				tableModelDetalle.setDataAsMapArray(resultado, true);
				
			}, "leer_detalle", p);
		}
	});
	
	this.add(tblProducto, {left: 0, top: 30, right: "15.3%", bottom: "52%"});
	
	
	
	
	
	
	
	
	
	//Tabla

	var tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "Cantidad"], ["fabrica", "producto", "capacidad", "unidad", "color", "cantidad"]);
	tableModelDetalle.setColumnSortable(0, false);
	tableModelDetalle.setColumnSortable(1, false);
	tableModelDetalle.setColumnSortable(2, false);
	tableModelDetalle.setColumnSortable(3, false);
	tableModelDetalle.setColumnSortable(4, false);
	tableModelDetalle.setColumnSortable(5, false);
	tableModelDetalle.addListener("dataChanged", function(e){
		var rowCount = tableModelDetalle.getRowCount();
		
		tblDetalle.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
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
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	

	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"16%", minWidth:100});
		resizeBehavior.set(1, {width:"42%", minWidth:100});
		resizeBehavior.set(2, {width:"9%", minWidth:100});
		resizeBehavior.set(3, {width:"4%", minWidth:100});
		resizeBehavior.set(4, {width:"21%", minWidth:100});
		resizeBehavior.set(5, {width:"8%", minWidth:100});

		
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	
	this.add(tblDetalle, {left: 0, top: "52%", right: "15.3%", bottom: 0});
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	
	

	
	
	dtfDesde.setTabIndex(2);
	btnBuscar.setTabIndex(7);
	tblProducto.setTabIndex(8);
	
	
	
	
		
	},
	members : 
	{

	}
});