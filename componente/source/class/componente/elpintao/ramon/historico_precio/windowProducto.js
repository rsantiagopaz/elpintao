qx.Class.define("componente.elpintao.ramon.historico_precio.windowProducto",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (caption)
	{
		this.base(arguments);
		
		this.set({
			caption: caption,
			width: 920,
			height: 470,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		
	
	this.addListenerOnce("appear", function(e){
		txtBuscar.focus();
	}, this);
	
	
	
	var application = qx.core.Init.getApplication();
	
	var timerId = null;
	var rpcBuscar = null;
	
	var functionBuscar = function(p) {
        var timer = qx.util.TimerManager.getInstance();
        // check for the old listener
        if (timerId !== null) {
          // stop the old one
          timer.stop(timerId);
          if (rpcBuscar != null) rpcBuscar.abort(rpcBuscar);
          timerId = null;
        }
        // start a new listener to update the controller
		timerId = timer.start(function() {
			rpcBuscar = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Historico_precio");
			rpcBuscar.addListener("completed", function(e){
				var resultado = e.getData().result;
				tableModel.setDataAsMapArray(resultado, true);
				if (resultado.length > 0) tbl.setFocusedCell(0, 0, true); else tbl.setFocusedCell();
								
				rpcBuscar = null;
			});
			rpcBuscar.callAsyncListeners(true, "buscar_producto_item", p);
			timerId = null;
		}, 0, this, null, 200);
	}
	
	
	
	

	var commandEscape = new qx.ui.command.Command("Escape");
	commandEscape.addListener("execute", function(e){
		this.destroy();
	}, this);
	
	this.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);

	

	
	
	
	var commandSeleccionar = new qx.ui.command.Command("Enter");
	commandSeleccionar.setEnabled(false);
	commandSeleccionar.addListener("execute", function(e){
		if (! selectionModel.isSelectionEmpty()) this.fireDataEvent("aceptado", tableModel.getRowData(tbl.getFocusedRow()));
	}, this);
	
		
	var menu = new componente.general.ramon.ui.menu.Menu();
	
	menu.addListener("appear", function(e){
		menu.setZIndex(this.getZIndex() + 1);
	}, this);
	var btnSeleccionar = new qx.ui.menu.Button("Seleccionar", null, commandSeleccionar);
	menu.add(btnSeleccionar);
	menu.memorizar();


	var txtBuscar = this.txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setLiveUpdate(true);
	txtBuscar.setPlaceholder("Buscar");
	txtBuscar.addListener("keypress", function(e){
		var keyIdentifier = e.getKeyIdentifier();
		
		if (keyIdentifier=="Down") {
			tbl.focus();
		} else if (keyIdentifier=="Enter") {
			var value = txtBuscar.getValue().trim();
			if (value.length >= 3) {
				var p = {cod_barra: value};
				functionBuscar(p);
			}
		}
	}, this);
	txtBuscar.addListener("changeValue", function(e){
		var value = txtBuscar.getValue().trim();
		if (value.length >= 3) {
			var p = {descrip: value};
			functionBuscar(p);
		} else if (value == "") {
			tableModel.setDataAsMapArray([], true);
		}
	}, this);
	


	this.add(txtBuscar, {left: 40, top: 5, right: 0});
	this.add(new qx.ui.basic.Label("Buscar:"), {left: 0, top: 5});
	
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Fábrica", "Descripción", "Capacidad", "U", "Color"], ["fabrica", "producto", "capacidad", "unidad", "color"]);


		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.toggleShowCellFocusIndicator();
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		
		tbl.addListener("cellDbltap", function(e){
			commandSeleccionar.fireDataEvent("execute", null);
		});

		
		var tableColumnModel = tbl.getTableColumnModel();
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"36.7%", minWidth:100});
		resizeBehavior.set(2, {width:"6.7%", minWidth:100});
		resizeBehavior.set(3, {width:"2.7%", minWidth:100});
		resizeBehavior.set(4, {width:"15.7%", minWidth:100});
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = ! selectionModel.isSelectionEmpty();
			commandSeleccionar.setEnabled(bool);
			menu.memorizar([commandSeleccionar]);
		});
		


		
		
		

		

		
		

				
		this.add(tbl, {left: 0, top: 35, right: 0, bottom: 0});
		tbl.setContextMenu(menu);

		
	txtBuscar.setTabIndex(1);
	tbl.setTabIndex(2);
		
	

	
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});