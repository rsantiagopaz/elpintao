qx.Class.define("elpintao.comp.remitos.pageResumenRemitos",
{
	extend : qx.ui.tabview.Page,
	construct : function (emitir)
	{
		this.base(arguments);
		
		
		
		
	this.setLabel("Resumen salidas de mercaderia");
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		slbEstado.focus();
	});
	


	var application = qx.core.Init.getApplication();
	var rowDataRemito = null;
	
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	
		

	var functionCalcularTotales = function(tableModelD, tableModelT) {
		var rowDataDetalle, rowDataTotales;
		var bandera, agregar_arancel, sucursal;
		var costo;
		
		tableModelT.setDataAsMapArray([{descrip: "Costo", total: 0}, {descrip: "P.lis.+IVA", total: 0}], true);
		
		for (var i = 0; i < tableModelD.getRowCount(); i++) {
			rowDataDetalle = tableModelD.getRowDataAsMap(i);
			
			agregar_arancel = false;

			if (application.arraySucursales[application.rowParamet.id_sucursal].deposito && rowDataDetalle.id_sucursal_para != "0") {
				sucursal = application.arraySucursales[rowDataDetalle.id_sucursal_para];
				if (rowDataDetalle.fecha >= sucursal.fecha_arancel) agregar_arancel = true;
			}
			
			//alert(qx.lang.Json.stringify(rowDataDetalle, null, 2));
			
			if (rowDataDetalle.cantidad > 0) {
				rowDataTotales = tableModelT.getRowDataAsMap(0);
				
				costo = rowDataDetalle.costo;
				if (agregar_arancel) costo = costo + ((costo * sucursal.arancel) / 100);
				
				tableModelT.setValueById("total", 0, rowDataTotales.total + (rowDataDetalle.cantidad * costo));
				rowDataTotales = tableModelT.getRowDataAsMap(1);
				tableModelT.setValueById("total", 1, rowDataTotales.total + (rowDataDetalle.cantidad * rowDataDetalle.plmasiva));
				bandera = true;
				for (var x = 2; x < tableModelT.getRowCount(); x++) {
					rowDataTotales = tableModelT.getRowDataAsMap(x);
					if (rowDataDetalle.id_unidad == rowDataTotales.id_unidad) {
						tableModelT.setValueById("total", x, tableModelT.getValueById("total", x) + (rowDataDetalle.cantidad * rowDataDetalle.capacidad));
						bandera = false;
						break;
					}
				}
				if (bandera) {
					tableModelT.addRowsAsMapArray([{id_unidad: rowDataDetalle.id_unidad, descrip: rowDataDetalle.unidad, total: rowDataDetalle.cantidad * rowDataDetalle.capacidad}], null, true);
				}
			}
		}
	}
	
	
	
		
		
	
	var layout = new qx.ui.layout.Grid(6, 6);
    for (var i = 0; i < 15; i++) {
    	layout.setColumnAlign(i, "left", "middle");
    }
    layout.setRowHeight(0, 24);
    
	var composite = new qx.ui.container.Composite(layout);
	
	composite.add(new qx.ui.basic.Label("Estado:"), {row: 0, column: 0});
	
	var slbEstado = this.slbEstado = new qx.ui.form.SelectBox();
	slbEstado.setWidth(90);
	slbEstado.add(new qx.ui.form.ListItem("Pendiente de entrega", null, "Registrado"));
	slbEstado.add(new qx.ui.form.ListItem("Entregado", null, "Autorizado"));
	slbEstado.add(new qx.ui.form.ListItem("Todo", null, "Todo"));
	slbEstado.setSelection([slbEstado.getChildren()[1]]);
	composite.add(slbEstado, {row: 0, column: 1});
	
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
		var resultado = rpc.callSync("autocompletarSucursal", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var slbSucursal = this.slbSucursal = new qx.ui.form.SelectBox();
	slbSucursal.setWidth(120);
	
	slbSucursal.add(new qx.ui.form.ListItem("-", null, "0"));
	for (var x in resultado) {
		slbSucursal.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	
	composite.add(new qx.ui.basic.Label("Sucursal:"), {row: 0, column: 8});
	composite.add(slbSucursal, {row: 0, column: 9});
	
	/*
	var cboSucursal = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Reparacion", "autocompletarSucursal", null, 2);
	cboSucursal.setWidth(120);
	var lstSucursal = this.lstSucursal = cboSucursal.getChildControl("list");
	lstSucursal.addListener("changeSelection", function(e){
		this.functionActualizar();
	}, this);
	composite.add(new qx.ui.basic.Label("Sucursal:"), {row: 0, column: 8});
	composite.add(cboSucursal, {row: 0, column: 9});
	*/
	

	
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
	
	
	/*
	var cboFabrica = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Reparacion", "autocompletarFabrica");
	cboFabrica.setWidth(200);
	var lstFabrica = this.lstFabrica = cboFabrica.getChildControl("list");
	lstFabrica.addListener("changeSelection", function(e){
		this.functionActualizar();
	}, this);
	composite.add(new qx.ui.basic.Label("Fábrica:"), {row: 0, column: 11});
	composite.add(cboFabrica, {row: 0, column: 12});
	*/
	

	
	var txtBuscar = this.txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setWidth(300);
	txtBuscar.setLiveUpdate(true);

	composite.add(new qx.ui.basic.Label("Producto:"), {row: 0, column: 14});
	composite.add(txtBuscar, {row: 0, column: 15});
	
	
	var btnBuscar = new qx.ui.form.Button("Buscar");
	btnBuscar.addListener("execute", function(e){
		var bounds = application.getRoot().getBounds();
		var imageLoading = new qx.ui.basic.Image("elpintao/loading66.gif");
		imageLoading.setBackgroundColor("#FFFFFF");
		imageLoading.setDecorator("main");
		application.getRoot().add(imageLoading, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
		
		tableModelDetalle.setDataAsMapArray([], true);
		tableModelTotgen.setDataAsMapArray([], true);
		tblDetalle.setFocusedCell();
		tblTotgen.setFocusedCell();
		
		var p = {};
		p.estado = this.slbEstado.getModelSelection().getItem(0);
		p.desde = this.dtfDesde.getValue();
		p.hasta = this.dtfHasta.getValue();
		p.id_sucursal = this.slbSucursal.getModelSelection().getItem(0);
		p.id_fabrica = this.slbFabrica.getModelSelection().getItem(0);
		p.buscar = this.txtBuscar.getValue().trim();
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Remitos2");
		rpc.setTimeout(1000 * 60 * 2);
		rpc.callAsync(function(resultado, error, id) {
			tableModelDetalle.setDataAsMapArray(resultado, true);
			
			functionCalcularTotales(tableModelDetalle, tableModelTotgen);
			
			imageLoading.destroy();
		}, "resumen_remitos", p);
	}, this);
	composite.add(btnBuscar, {row: 0, column: 16});
	
	this.add(composite, {left: 0, top: 0});
	
		
	
	
		
		

		
		
		
		
	//Tabla

	var tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Nro.remito", "Fecha", "Fábrica", "Producto", "Capacidad", "U", "Color", "Cantidad"], ["nro_remito", "fecha", "fabrica", "producto", "capacidad", "unidad", "color", "cantidad"]);
	tableModelDetalle.setColumnSortable(0, false);
	tableModelDetalle.setColumnSortable(1, false);
	tableModelDetalle.setColumnSortable(2, false);
	tableModelDetalle.setColumnSortable(3, false);
	tableModelDetalle.setColumnSortable(4, false);
	tableModelDetalle.setColumnSortable(5, false);
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
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	
	var celleditorDate = new qx.ui.table.cellrenderer.Date();
	celleditorDate.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd HH:mm"));
	tableColumnModelDetalle.setDataCellRenderer(1, celleditorDate);
	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"9%", minWidth:100});
		resizeBehavior.set(1, {width:"8%", minWidth:100});
		resizeBehavior.set(2, {width:"13%", minWidth:100});
		resizeBehavior.set(3, {width:"39%", minWidth:100});
		resizeBehavior.set(4, {width:"7%", minWidth:100});
		resizeBehavior.set(5, {width:"3%", minWidth:100});
		resizeBehavior.set(6, {width:"15%", minWidth:100});
		resizeBehavior.set(7, {width:"6%", minWidth:100});

		
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	
	this.add(tblDetalle, {left: 0, top: 30, right: "15.3%", bottom: 0});
	
	
	
	
	//Tabla

	var tableModelTotgen = new qx.ui.table.model.Simple();
	tableModelTotgen.setColumns(["", "Total"], ["descrip", "total"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblTotgen = new componente.general.ramon.ui.table.Table(tableModelTotgen, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblTotgen.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblTotgen.setShowCellFocusIndicator(false);
	tblTotgen.toggleColumnVisibilityButtonVisible();
	tblTotgen.toggleStatusBarVisible();
	
	var tableColumnModelTotgen = tblTotgen.getTableColumnModel();
	
	var renderer = new qx.ui.table.cellrenderer.Number();
	renderer.setNumberFormat(numberformatMonto);
	tableColumnModelTotgen.setDataCellRenderer(1, renderer);
	
	this.add(tblTotgen, {left: "85.3%", top: 30, right: 0, bottom: "45%"});
	
	
	
	

	
	
	slbEstado.setTabIndex(1);
	dtfDesde.setTabIndex(2);
	dtfHasta.setTabIndex(3);
	slbSucursal.setTabIndex(4);
	slbFabrica.setTabIndex(5);
	txtBuscar.setTabIndex(6);
	btnBuscar.setTabIndex(7);
	tblDetalle.setTabIndex(8);
	tblTotgen.setTabIndex(9);
	
	
	
	
		
	},
	members : 
	{

	}
});