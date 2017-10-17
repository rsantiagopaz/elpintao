qx.Class.define("elpintao.comp.remitos.pageRemitos",
{
	extend : qx.ui.tabview.Page,
	construct : function (emitir)
	{
		this.base(arguments);
		
		
		
		
	this.setLabel((emitir) ? "Salidas de mercaderia" : "Entradas de mercaderia");
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		tblRemito.focus();
	});
	
	this.addListenerOnce("close", function(e){
		this.imageLoadingRemito.destroy();
		this.imageLoadingDetalle.destroy();
	}, this);
	


	var application = qx.core.Init.getApplication();
	var rowDataRemito = null;
	
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	
	var bounds = application.getRoot().getBounds();
	
	var imageLoadingRemito = this.imageLoadingRemito = new qx.ui.basic.Image("elpintao/loading66.gif");
	imageLoadingRemito.setVisibility("hidden");
	imageLoadingRemito.setBackgroundColor("#FFFFFF");
	imageLoadingRemito.setDecorator("main");
	application.getRoot().add(imageLoadingRemito, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
	
	var imageLoadingDetalle = this.imageLoadingDetalle = new qx.ui.basic.Image("elpintao/loading66.gif");
	imageLoadingDetalle.setVisibility("hidden");
	imageLoadingDetalle.setBackgroundColor("#FFFFFF");
	imageLoadingDetalle.setDecorator("main");
	application.getRoot().add(imageLoadingDetalle, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
	

	
	
	
	var functionActualizar = this.functionActualizar = qx.lang.Function.bind(function(id_remito) {
        var timer = qx.util.TimerManager.getInstance();
        // check for the old listener
        if (this.timerId != null) {
          // stop the old one
          timer.stop(this.timerId);
          if (this.rpc != null) this.rpc.abort(this.opaqueCallRef);
          this.timerId = null;
        }
        
        application.debug("actualizar");

		tblRemito.blur();
		tblRemito.setFocusedCell();
        tableModelDetalle.setDataAsMapArray([], true);
		tableModelTotales.setDataAsMapArray([], true);
		tableModel.setDataAsMapArray([], true);
		tableModelTotgen.setDataAsMapArray([], true);
			
        // start a new listener to update the controller
		this.timerId = timer.start(function(userData, timerId) {
			imageLoadingRemito.setVisibility("visible");
			
			var p = {};
			p.estado = this.slbEstado.getModelSelection().getItem(0);
			p.desde = this.dtfDesde.getValue();
			p.hasta = this.dtfHasta.getValue();
			p.id_sucursal = this.slbSucursal.getModelSelection().getItem(0);
			p.id_fabrica = this.slbFabrica.getModelSelection().getItem(0);
			p.buscar = this.txtBuscar.getValue().trim();
			
			this.rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Remitos");
			this.rpc.setTimeout(1000 * 60 * 2);
			this.rpc.addListener("completed", function(e){
				var resultado = e.getData().result;
				
				tableModel.setDataAsMapArray(resultado.remito, true);
				
				if (id_remito == null) {
					if (tableModel.getRowCount() > 0) tblRemito.setFocusedCell(0, 0, true);
				} else {
					if (emitir) {
						tblRemito.buscar("id_remito_emi", id_remito);
					} else {
						tblRemito.buscar("id_remito_rec", id_remito);
					}
					
					tblRemito.focus();
				}
				
				imageLoadingRemito.setVisibility("hidden");
			});
			this.rpc.addListener("failed", function(e){
				imageLoadingRemito.setVisibility("hidden");
			});
			
			if (emitir) {
				this.opaqueCallRef = this.rpc.callAsyncListeners(true, "leer_remitos_emi", p);
			} else {
				this.opaqueCallRef = this.rpc.callAsyncListeners(true, "leer_remitos_rec", p);
			}
		}, null, this, null, 200);
	}, this);
		
		

	var functionCalcularTotales = function(tableModelD, tableModelT) {
		var rowDataAsMapDetalle, rowDataAsMapTotales;
		var bandera;
		
		//tableModelT.setDataAsMapArray([{descrip: "Costo", total: 0}, {descrip: "P.lis.+IVA", total: 0}], true);
		tableModelT.setDataAsMapArray([], true);
		
		for (var i = 0; i < tableModelD.getRowCount(); i++) {
			rowDataAsMapDetalle = tableModelD.getRowDataAsMap(i);
			
			if (rowDataAsMapDetalle.cantidad > 0) {
				//rowDataAsMapTotales = tableModelT.getRowDataAsMap(0);
				
				//tableModelT.setValueById("total", 0, rowDataAsMapTotales.total + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.costo));
				//rowDataAsMapTotales = tableModelT.getRowDataAsMap(1);
				//tableModelT.setValueById("total", 1, rowDataAsMapTotales.total + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.plmasiva));
				bandera = true;
				for (var x = 0; x < tableModelT.getRowCount(); x++) {
					rowDataAsMapTotales = tableModelT.getRowDataAsMap(x);
					if (rowDataAsMapDetalle.id_unidad == rowDataAsMapTotales.id_unidad) {
						tableModelT.setValueById("total", x, tableModelT.getValueById("total", x) + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad));
						bandera = false;
						break;
					}
				}
				if (bandera) {
					tableModelT.addRowsAsMapArray([{id_unidad: rowDataAsMapDetalle.id_unidad, descrip: rowDataAsMapDetalle.unidad, total: rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad}], null, true);
				}
			}
		}
	}
	
	
	
	var rpc = new qx.io.remote.Rpc("services/", "comp.Reparacion");
	try {
		var resultado = rpc.callSync("autocompletarFabrica", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
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
	slbEstado.add(new qx.ui.form.ListItem((emitir) ? "Pendiente de entrega" : "Pendiente de ingreso", null, "Registrado"));
	slbEstado.add(new qx.ui.form.ListItem((emitir) ? "Entregado" : "Ingresado", null, "Autorizado"));
	slbEstado.add(new qx.ui.form.ListItem("Todo", null, "Todo"));
	slbEstado.addListener("changeSelection", function(e){
		this.functionActualizar();
	}, this);
	composite.add(slbEstado, {row: 0, column: 1});
	
	var aux = new Date;
	var dtfDesde = this.dtfDesde = new qx.ui.form.DateField();
	dtfDesde.setWidth(90);
	var dtfHasta = this.dtfHasta = new qx.ui.form.DateField();
	dtfHasta.setWidth(90);
	dtfHasta.setValue(aux);
	aux.setMonth(aux.getMonth() - 1);
	dtfDesde.setValue(aux);
	dtfDesde.addListener("changeValue", function(e){
		this.functionActualizar();
	}, this);
	dtfHasta.addListener("changeValue", function(e){
		this.functionActualizar();
	}, this);
	
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
	slbSucursal.addListener("changeSelection", function(e){
		this.functionActualizar();
	}, this);
	
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
	
	slbFabrica.add(new qx.ui.form.ListItem(" ", null, "0"));
	for (var x in resultado) {
		slbFabrica.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	slbFabrica.addListener("changeSelection", function(e){
		this.functionActualizar();
	}, this);
	
	//composite.add(new qx.ui.basic.Label("Fábrica:"), {row: 0, column: 11});
	//composite.add(slbFabrica, {row: 0, column: 12});
	
	
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
	txtBuscar.addListener("changeValue", function(e){
		var value = txtBuscar.getValue();
		if (value == "" || value.trim().length >= 3) this.functionActualizar();
	}, this);
	//composite.add(new qx.ui.basic.Label("Producto:"), {row: 0, column: 14});
	//composite.add(txtBuscar, {row: 0, column: 15});
	
	this.add(composite, {left: 0, top: 0});
	
		
	
	
	
	//Menu de contexto Pedido
	
	var menutblRemito = new componente.general.ramon.ui.menu.Menu();
	var btnAutorizar = new qx.ui.menu.Button((emitir) ? "Entregar..." : "Ingresar...");
	btnAutorizar.setEnabled(false);
	btnAutorizar.addListener("execute", function(e) {
		var win = new elpintao.comp.remitos.windowAutorizaRemito(rowDataRemito, emitir);
		win.addListener("actualizar", function(e){
			var data = e.getData();

			functionActualizar(data);
		});
		win.addListener("aceptado", function(e){
			var data = e.getData();
			
			functionActualizar(data);
			//application.functionTransmitir();
			
			window.open("services/class/comp/Impresion.php?rutina=imprimir_remito&emitir=" + emitir + "&id_remito=" + data);
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	var btnImprimir = new qx.ui.menu.Button("Imprimir");
	btnImprimir.setEnabled(false);
	btnImprimir.addListener("execute", function(e){
		window.open("services/class/comp/Impresion.php?rutina=imprimir_remito&emitir=" + emitir + "&id_remito=" + ((emitir) ? rowDataRemito.id_remito_emi : rowDataRemito.id_remito_rec));
	});
	var btnNuevo = new qx.ui.menu.Button("Nuevo remito...");
	btnNuevo.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(null, emitir);
		win.addListener("aceptado", function(e){
			var data = e.getData();

			functionActualizar(data);
			//application.functionTransmitir();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnModificar = new qx.ui.menu.Button("Modificar remito...");
	btnModificar.setEnabled(false);
	btnModificar.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(rowDataRemito, emitir);
		win.addListener("aceptado", function(e){
			var data = e.getData();

			functionActualizar(data);
			//application.functionTransmitir();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	menutblRemito.add(btnAutorizar);
	menutblRemito.add(btnImprimir);
	menutblRemito.addSeparator();
	menutblRemito.add(btnNuevo);
	menutblRemito.add(btnModificar);
	menutblRemito.memorizar();
	
		
		
		//Tabla

		
		var tableModel = new qx.ui.table.model.Simple();
		if (emitir) {
			tableModel.setColumns(["Nro.remito", "Para", "Transporta", "Autoriza", "Fecha", "Estado"], ["nro_remito", "destino_descrip", "transporta", "autoriza", "fecha", "estado"]);
		} else {
			tableModel.setColumns(["Nro.remito", "De", "Transporta", "Autoriza", "Fecha", "Estado"], ["nro_remito", "destino_descrip", "transporta", "autoriza", "fecha", "estado"]);
		}

		tableModel.setColumnSortable(0, false);
		tableModel.setColumnSortable(1, false);
		tableModel.setColumnSortable(2, false);
		tableModel.setColumnSortable(3, false);
		tableModel.setColumnSortable(4, false);
		tableModel.setColumnSortable(5, false);

		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblRemito = new componente.general.ramon.ui.table.Table(tableModel, custom);
		tblRemito.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tblRemito.toggleColumnVisibilityButtonVisible();
		tblRemito.toggleShowCellFocusIndicator();
		tblRemito.toggleStatusBarVisible();

		tblRemito.addListener("cellDbltap", function(e){

		});
		
		
		var tableColumnModel = tblRemito.getTableColumnModel();
		//tableColumnModel.setColumnVisible(0, false);
      // Obtain the behavior object to manipulate
		var resizeBehavior = tableColumnModel.getBehavior();
		//resizeBehavior.set(0, {width:"40%", minWidth:100});
		//resizeBehavior.set(1, {width:"20%", minWidth:100});
		//resizeBehavior.set(2, {width:"40%", minWidth:100});
		
		var cellrendererDate = new qx.ui.table.cellrenderer.Date();
		cellrendererDate.setDateFormat(new qx.util.format.DateFormat("y-MM-dd HH:mm"));
		tableColumnModel.setDataCellRenderer(4, cellrendererDate);
		
		var cellrendererReplace = new qx.ui.table.cellrenderer.Replace();
		cellrendererReplace.setReplaceMap({
			"R": (emitir) ? "Pendiente de entrega" : "Pendiente de ingreso",
			"A": (emitir) ? "Entregado" : "Ingresado"
		});
		tableColumnModel.setDataCellRenderer(5, cellrendererReplace);
		

		
		var selectionModel = tblRemito.getSelectionModel();
		selectionModel.addListener("changeSelection", function(e){
			if (!selectionModel.isSelectionEmpty()) {
		        var timer = qx.util.TimerManager.getInstance();
		        // check for the old listener
		        if (this.timerId != null) {
		          // stop the old one
		          timer.stop(this.timerId);
		          if (this.rpc != null) this.rpc.abort(this.opaqueCallRef);
		          this.timerId = null;
		        }

				this.timerId = timer.start(function(userData, timerId) {
					imageLoadingDetalle.setVisibility("visible");
					
					rowDataRemito = tableModel.getRowData(tblRemito.getFocusedRow());
					tblDetalle.setFocusedCell();
					
					var p = {};
					p.emitir = emitir;
					p.id_remito = ((emitir) ? rowDataRemito.id_remito_emi : rowDataRemito.id_remito_rec) ;
					p.id_fabrica = slbFabrica.getModelSelection().getItem(0);
					p.buscar = txtBuscar.getValue().trim();
					
					this.rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
					this.rpc.setTimeout(1000 * 60 * 2);
					this.opaqueCallRef = this.rpc.callAsync(qx.lang.Function.bind(function(resultado, error, id){
						//alert(qx.lang.Json.stringify(resultado, null, 2));
						
						if (error == null) {
							tableModelDetalle.setDataAsMapArray(resultado, true);
							btnModificar.setEnabled(rowDataRemito.estado == 'R');
							btnAutorizar.setEnabled(rowDataRemito.estado == 'R');
							btnImprimir.setEnabled(rowDataRemito.estado == 'A');
							menutblRemito.memorizar([btnAutorizar, btnImprimir, btnModificar]);
						}
						
						functionCalcularTotales(tableModelDetalle, tableModelTotales);
						
						imageLoadingDetalle.setVisibility("hidden");
					}, this), "leer_remitos_detalle", p);
				}, null, this, null, 200);
			}
		});
		
		tblRemito.setContextMenu(menutblRemito);
		
		this.add(tblRemito, {left: 0, top: 30, right: 0, bottom: "45%"});
		
		
		
		
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
	

	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"16%", minWidth:100});
		resizeBehavior.set(1, {width:"42%", minWidth:100});
		resizeBehavior.set(2, {width:"9%", minWidth:100});
		resizeBehavior.set(3, {width:"4%", minWidth:100});
		resizeBehavior.set(4, {width:"21%", minWidth:100});
		resizeBehavior.set(5, {width:"8%", minWidth:100});

		
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	
	this.add(tblDetalle, {left: 0, top: "56%", right: "15%", bottom: 0});
	
	
	
	
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
	
	//this.add(tblTotgen, {left: "85.3%", top: 30, right: 0, bottom: "45%"});
	
	
	
	
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
	
	var tableColumnModelTotales = tblTotales.getTableColumnModel();
	
	var renderer = new qx.ui.table.cellrenderer.Number();
	renderer.setNumberFormat(numberformatMonto);
	tableColumnModelTotales.setDataCellRenderer(1, renderer);
	
	this.add(tblTotales, {left: "85.3%", top: "56%", right: 0, bottom: 0});
	
	
	
	
	
	
	functionActualizar();
	if (tableModel.getRowCount()>0) tblRemito.setFocusedCell(0, 0, true);
	
	
	slbEstado.setTabIndex(1);
	dtfDesde.setTabIndex(2);
	dtfHasta.setTabIndex(3);
	slbSucursal.setTabIndex(4);
	slbFabrica.setTabIndex(5);
	txtBuscar.setTabIndex(6);
	tblRemito.setTabIndex(7);
	tblTotgen.setTabIndex(8);
	tblDetalle.setTabIndex(9);
	tblTotales.setTabIndex(10);
	
	
	
	
		
	},
	members : 
	{

	}
});