qx.Class.define("elpintao.comp.remitos.pageRemitosEmi",
{
	extend : elpintao.comp.remitos.pageRemitos,
	construct : function ()
	{
		this.base(arguments);
		
	this.setLabel('Remitos emitidos');
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		tblRemito.focus();
	});
	


	var application = qx.core.Init.getApplication();
	var rowDataRemito = null;
	
	
	
	var functionActualizar = this.functionActualizar = qx.lang.Function.bind(function() {
		var p = {};
		p.estado = this.slbEstado.getSelection()[0].getLabel();
		p.desde = this.dtfDesde.getValue();
		p.hasta = this.dtfHasta.getValue();
		if (! this.lstSucursal.isSelectionEmpty()) p.id_sucursal = this.lstSucursal.getModelSelection().getItem(0);
		if (! this.lstFabrica.isSelectionEmpty()) p.id_fabrica = this.lstFabrica.getModelSelection().getItem(0);
		p.buscar = this.txtBusca.getValue().trim();
		
		
        var timer = qx.util.TimerManager.getInstance();
        // check for the old listener
        if (this.timerId != null) {
          // stop the old one
          timer.stop(this.timerId);
          if (this.rpc != null) this.rpc.abort(this.opaqueCallRef);
          this.timerId = null;
        }
        // start a new listener to update the controller
		this.timerId = timer.start(function(userData, timerId) {
			this.rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
			this.rpc.addListener("completed", function(e){
				var data = e.getData();
				
				tblRemito.blur();
				tblRemito.setFocusedCell();
				tableModelDetalle.setDataAsMapArray([], true);
				tableModel.setDataAsMapArray(data.result, true);
				
				if (tableModel.getRowCount() > 0) tblRemito.setFocusedCell(0, 0, true);
			}, this);
			
			this.opaqueCallRef = this.rpc.callAsyncListeners(true, "leer_remitos_emi", p);
		}, null, this, null, 200);
	}, this);
	

	
	//Menu de contexto Pedido
	
	var menutblRemito = new componente.general.ramon.ui.menu.Menu();
	var btnAutorizar = new qx.ui.menu.Button("Autorizar...");
	btnAutorizar.setEnabled(false);
	btnAutorizar.addListener("execute", function(e) {
		var win = new elpintao.comp.remitos.windowAutorizaRemito(rowDataRemito, true);
		win.addListener("actualizar", function(e){
			functionActualizar();
			tblRemito.buscar("id_remito_emi", e.getData());
			tblRemito.focus();
		});
		win.addListener("aceptado", function(e){
			functionActualizar();
			tblRemito.buscar("id_remito_emi", e.getData());
			tblRemito.focus();
			application.functionTransmitir();
			btnImprimir.execute();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	var btnImprimir = new qx.ui.menu.Button("Imprimir");
	btnImprimir.setEnabled(false);
	btnImprimir.addListener("execute", function(e){
		window.open("services/class/comp/Impresion.php?rutina=imprimir_remito&emitir=true&id_remito_emi=" + rowDataRemito.id_remito_emi);
	});
	var btnNuevo = new qx.ui.menu.Button("Nuevo remito...");
	btnNuevo.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(null, true);
		win.addListener("aceptado", function(e){
			var data = e.getData();

			functionActualizar();
			tblRemito.buscar("id_remito_emi", data);
			tblRemito.focus();
			application.functionTransmitir();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnModificar = new qx.ui.menu.Button("Modificar remito...");
	btnModificar.setEnabled(false);
	btnModificar.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(rowDataRemito, true);
		win.addListener("aceptado", function(e){
			var data = e.getData();

			functionActualizar();
			tblRemito.buscar("id_remito_emi", data);
			tblRemito.focus();
			application.functionTransmitir();
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
		tableModel.setColumns(["Nro.remito", "Para", "Transporta", "Autoriza", "Fecha", "Estado"], ["nro_remito", "destino_descrip", "transporta", "autoriza", "fecha", "estado_descrip"]);
		//tableModel.setDataAsMapArray(resultado.contacto, true);

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
		
		var selectionModel = tblRemito.getSelectionModel();
		selectionModel.addListener("changeSelection", function(e){
			if (!selectionModel.isSelectionEmpty()) {
				rowDataRemito = tableModel.getRowData(tblRemito.getFocusedRow());
				tblDetalle.setFocusedCell();
				
				var rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
				try {
					var resultado = rpc.callSync("leer_remitos_emi_detalle", {id_remito_emi: rowDataRemito.id_remito_emi});
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				tableModelDetalle.setDataAsMapArray(resultado);
				btnModificar.setEnabled(rowDataRemito.estado=='R');
				btnAutorizar.setEnabled(rowDataRemito.estado=='R');
				btnImprimir.setEnabled(rowDataRemito.estado=='A');
				menutblRemito.memorizar([btnAutorizar, btnImprimir, btnModificar]);
			}
		});
		
		tblRemito.setContextMenu(menutblRemito);
		
		this.add(tblRemito, {left: 0, top: 25, right: 0, bottom: "45%"});
		
		
		
		
	//Tabla

	var tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "Cantidad"], ["fabrica", "producto", "capacidad", "unidad", "color", "cantidad"]);
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
		resizeBehavior.set(0, {width:"9%", minWidth:100});
		resizeBehavior.set(1, {width:"42%", minWidth:100});
		resizeBehavior.set(2, {width:"9%", minWidth:100});
		resizeBehavior.set(3, {width:"4%", minWidth:100});
		resizeBehavior.set(4, {width:"15%", minWidth:100});
		resizeBehavior.set(5, {width:"8%", minWidth:100});

		
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	
	this.add(tblDetalle, {left: 0, top: "56%", right: 0, bottom: 0});
	
	functionActualizar();
	if (tableModel.getRowCount()>0) tblRemito.setFocusedCell(0, 0, true);
		
		
	},
	members : 
	{
		
	}
});