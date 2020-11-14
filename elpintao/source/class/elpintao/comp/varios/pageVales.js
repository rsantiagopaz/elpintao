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
		btnFiltrar.execute();
	});
	


	var application = qx.core.Init.getApplication();
	
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	var rowDataVale;
		
		
	
	var layout = new qx.ui.layout.Grid(6, 6);
    for (var i = 0; i < 15; i++) {
    	layout.setColumnAlign(i, "left", "middle");
    }
    layout.setRowHeight(0, 24);
    
	var composite = new qx.ui.container.Composite(layout);
	this.add(composite, {left: 0, top: 0});
	
	
	
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
	
	
	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
	try {
		var resultado = rpc.callSync("autocompletarSucursal", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var slbSucursal = this.slbSucursal = new qx.ui.form.SelectBox();
	slbSucursal.setWidth(120);
	
	slbSucursal.add(new qx.ui.form.ListItem("-", null, "0"));
	for (var x in resultado) {
		aux = new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model);
		slbSucursal.add(aux);
		if (resultado[x].model == application.rowParamet.id_sucursal) slbSucursal.setSelection([aux]);
	}
	
	composite.add(new qx.ui.basic.Label("Sucursal:"), {row: 0, column: 8});
	composite.add(slbSucursal, {row: 0, column: 9});
	
	
	
	var slbGenera = new qx.ui.form.SelectBox();
	slbGenera.add(new qx.ui.form.ListItem("Genera", null, true));
	slbGenera.add(new qx.ui.form.ListItem("Retira", null, false));
	composite.add(slbGenera, {row: 0, column: 11});
	
	
	
	
	var btnFiltrar = new qx.ui.form.Button("Aplicar filtro");
	btnFiltrar.addListener("execute", function(e){
		tblProducto.setFocusedCell();
		tableModelProducto.setDataAsMapArray([], true);
		
		tblDetalle.setFocusedCell();
		tableModelDetalle.setDataAsMapArray([], true);
		
		btnAnular.setEnabled(false);
		menu.memorizar([btnAnular]);
		
		var p = {};
		p.desde = dtfDesde.getValue();
		p.hasta = dtfHasta.getValue();
		p.id_sucursal = slbSucursal.getSelection()[0].getModel();
		p.genera = slbGenera.getSelection()[0].getModel();
		
		//alert(qx.lang.Json.stringify(p, null, 2));
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Vales");
		rpc.callAsync(function(resultado, error, id) {
			
			//alert(qx.lang.Json.stringify(resultado, null, 2));

			tableModelProducto.setDataAsMapArray(resultado, true);

		}, "leer_vales", p);
	}, this);
	
	composite.add(btnFiltrar, {row: 0, column: 18});
	
	
		
		
	
	
	
	
	
	
	
	
	
	
	var menu = new componente.general.ramon.ui.menu.Menu();

	var btnAnular = new qx.ui.menu.Button("Entregar...");
	btnAnular.setEnabled(false);
	btnAnular.addListener("execute", function(e){
		setTimeout(function(){
			var nro_vale = prompt("Ingrese el Nro Completo del Vale de Mercaderia (Suc-Nro)", rowDataVale.nro_vale);
			if (nro_vale != null && confirm("Esta seguro que desea Entregar la Mercaderia del Vale?")) {
				
				var p = {};
				p.nro_vale = nro_vale;
				
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.alejandro.ValesMercaderia");
				rpc.setTimeout(60000 * 5);
				rpc.addListener("completed", function(e){
					var data = e.getData();
					
					alert("Vale entregado!");
		
				}, this);
				rpc.addListener("failed", function(e){
					var data = e.getData();
					
					alert(data);
					
				}, this);
				
				rpc.callAsyncListeners(true, "entregarVale", p);
			}
		});
	});
	
	menu.add(btnAnular);
	menu.memorizar();
	
	
		
		
	//Tabla

	var tableModelProducto = new qx.ui.table.model.Simple();
	tableModelProducto.setColumns(["Nro.Vale", "Factura", "Cliente", "Donde retira", "Fecha", "Estado"], ["nro_vale", "factura", "cliente", "sucursal_descrip", "fyh", "estado"]);
	//tableModelProducto.setColumnSortable(0, false);
	//tableModelProducto.setColumnSortable(1, false);
	//tableModelProducto.setColumnSortable(2, false);
	//tableModelProducto.setColumnSortable(3, false);
	//tableModelProducto.setColumnSortable(4, false);
	//tableModelProducto.setColumnSortable(5, false);
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
	tblProducto.setContextMenu(menu);
	
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
			rowDataVale = tableModelProducto.getRowDataAsMap(focusedRow);
			
			tblDetalle.setFocusedCell();
			
			btnAnular.setEnabled(true);
			menu.memorizar([btnAnular]);
			
			var p = {};
			p.id_valemercaderia = rowDataVale.id_valemercaderia;

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
	tblProducto.setTabIndex(8);
	
	
	
	
		
	},
	members : 
	{

	}
});