qx.Class.define("elpintao.comp.remitos.pageRemitosRec",
{
	extend : qx.ui.tabview.Page,
	construct : function ()
	{
		this.base(arguments);
		
	this.setLabel('Remitos recibidos');
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
		
	this.addListenerOnce("appear", function(e){
		tblRemito.focus();
	});
	
	
	
	var application = qx.core.Init.getApplication();
	var rowDataRemito = null;
	
	

	var functionActualizar = function() {
		var rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
		try {
			var resultado = rpc.callSync("leer_remitos_rec", {ver: rgp.getSelection()[0].getLabel()});
		} catch (ex) {
			alert("Sync exception: " + ex);
		}

		tblRemito.blur();
		tblRemito.setFocusedCell();
		tableModelDetalle.setDataAsMapArray([], true);
		tableModel.setDataAsMapArray(resultado, true);
	}
	
	
	this.add(new qx.ui.basic.Label("Ver:"), {left: 0 , top: 0});
	
	var rbt1 = new qx.ui.form.RadioButton("Registrado");
	var rbt2 = new qx.ui.form.RadioButton("Autorizado");
	var rbt3 = new qx.ui.form.RadioButton("Todo");

	var rgp = new qx.ui.form.RadioGroup();
	rgp.add(rbt1, rbt2, rbt3);
	rgp.addListener("changeSelection", function(e){
		functionActualizar();
		if (tableModel.getRowCount() > 0) tblRemito.setFocusedCell(0, 0, true);
		tblRemito.focus();
	});
	
	this.add(rbt1, {left: 30 , top: 0});
	this.add(rbt2, {left: 120 , top: 0});
	this.add(rbt3, {left: 220 , top: 0});

	
	
	
	
	//Menu de contexto Pedido
	
	var menutblRemito = new componente.general.ramon.ui.menu.Menu();
	var btnAutorizar = new qx.ui.menu.Button("Autorizar...");
	btnAutorizar.setEnabled(false);
	btnAutorizar.addListener("execute", function(e) {
		var win = new elpintao.comp.remitos.windowAutorizaRemito(rowDataRemito, false);
		win.addListener("actualizar", function(e){
			var data = e.getData();
			
			functionActualizar();
			tblRemito.buscar("id_remito_rec", data);
			tblRemito.focus();
		});
		win.addListener("aceptado", function(e){
			var data = e.getData();
			
			functionActualizar();
			tblRemito.buscar("id_remito_rec", data);
			tblRemito.focus();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnImprimir = new qx.ui.menu.Button("Imprimir");
	btnImprimir.setEnabled(false);
	btnImprimir.addListener("execute", function(e){
		window.open("services/class/comp/Impresion.php?rutina=imprimir_remito&emitir=false&id_remito_rec=" + rowDataRemito.id_remito_rec);
	});
	
	var btnNuevo = new qx.ui.menu.Button("Nuevo remito...");
	btnNuevo.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(null, false);
		win.addListener("aceptado", function(e){
			var data = e.getData();
			
			functionActualizar();
			tblRemito.buscar("id_remito_rec", data);
			tblRemito.focus();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnModificar = new qx.ui.menu.Button("Modificar remito...");
	btnModificar.setEnabled(false);
	btnModificar.addListener("execute", function(e){
		var win = new elpintao.comp.remitos.windowRemito(rowDataRemito, false);
		win.addListener("aceptado", function(e){
			var data = e.getData();
			
			functionActualizar();
			tblRemito.buscar("id_remito_rec", data);
			tblRemito.focus();
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
		tableModel.setColumns(["Nro.remito", "De", "Transporta", "Autoriza", "Fecha", "Estado"], ["nro_remito", "destino_descrip", "transporta", "autoriza", "fecha", "estado_descrip"]);
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
					var resultado = rpc.callSync("leer_remitos_rec_detalle", {id_remito_rec: rowDataRemito.id_remito_rec});
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
	if (tableModel.getRowCount() > 0) tblRemito.setFocusedCell(0, 0, true);
	
		
	},
	members : 
	{
		
	}
});