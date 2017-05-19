qx.Class.define("elpintao.comp.pedidos.windowProducto",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (caption, controlar_stock)
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
		
	
	this.addListener("appear", function(e){
		txtBuscar.focus();
	});
		
	this.addListener("disappear", function(e){
		txtBuscar.setValue("");
		functionKeyUp();
	});
	
	
	
	var application = qx.core.Init.getApplication();
	
	var stringModoBuscar = null;
	
	var functionKeyUp = function(keyIdentifier, id_fabrica) {
		if (tbl.isEditing()) tbl.cancelEditing();
		var texto = txtBuscar.getValue().trim();

		if (keyIdentifier=="Down") {
			tbl.focus();
		} else if (keyIdentifier=="Enter") {
			if (texto!="") {
				var p = {};
				p.cod_barra = texto;
				var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
				rpc.callAsync(function(resultado, error, id){
					tableModel.setDataAsMapArray(resultado, true);
					if (resultado.length > 0) tbl.setFocusedCell(8, 0, true); else tbl.setFocusedCell();
				}, "buscar_productos", p);
			} else {
				tbl.setFocusedCell();
				tableModel.setDataAsMapArray([], true);			
			}
		} else if (texto.length >= 3) {
			var p = {};
			p.id_fabrica = id_fabrica;
			p.descrip = texto;
			var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
			rpc.callAsync(function(resultado, error, id){
				tableModel.setDataAsMapArray(resultado, true);
				if (resultado.length > 0) tbl.setFocusedCell(8, 0, true); else tbl.setFocusedCell();
			}, "buscar_productos", p);
		} else {
			tbl.setFocusedCell();
			tableModel.setDataAsMapArray([], true);
		}
	}
	
	
	
	var commandSeleccionar = new qx.ui.command.Command("F2");
	commandSeleccionar.setEnabled(false);
	commandSeleccionar.addListener("execute", function(e){
		tbl.setFocusedCell(8, tbl.getFocusedRow(), true);
		tbl.startEditing();
	}, this);
	
		
	var menu = new componente.general.ramon.ui.menu.Menu();
	
	menu.addListener("appear", function(e){
		menu.setZIndex(this.getZIndex() + 1);
	}, this);
	var btnSeleccionar = new qx.ui.menu.Button("Editar", null, commandSeleccionar);
	menu.add(btnSeleccionar);
	menu.memorizar();


	var txtBuscar = this.txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setLiveUpdate(true);
	txtBuscar.setPlaceholder("Buscar");
	txtBuscar.addListener("keyup", function(e){
		functionKeyUp(e.getKeyIdentifier(), this.id_fabrica);
	}, this);
	


	this.add(txtBuscar, {left: 40, top: 5, right: 0});
	this.add(new qx.ui.basic.Label("Buscar:"), {left: 0, top: 5});
	
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "P.lis.", "P.lis.+IVA", "Stock", "Cantidad"], ["fabrica", "producto", "capacidad", "unidad", "color", "precio_lista", "plmasiva", "stock", "cantidad"]);
		tableModel.setColumnEditable(8, true);


		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.setShowCellFocusIndicator(true);
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		tbl.edicion = "desplazamiento_vertical";

		
		var tableColumnModel = tbl.getTableColumnModel();
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"36.7%", minWidth:100});
		resizeBehavior.set(2, {width:"6.7%", minWidth:100});
		resizeBehavior.set(3, {width:"2.7%", minWidth:100});
		resizeBehavior.set(4, {width:"15.7%", minWidth:100});
		resizeBehavior.set(5, {width:"7.7%", minWidth:100});
		resizeBehavior.set(6, {width:"7.7%", minWidth:100});
		resizeBehavior.set(7, {width:"5%", minWidth:100});
		resizeBehavior.set(8, {width:"5.3%", minWidth:100});
		
	var celleditorNumber = new qx.ui.table.celleditor.TextField();
	celleditorNumber.setValidationFunction(function(newValue, oldValue){
		newValue = newValue.trim();
		if (newValue=="") return oldValue;
		else if (isNaN(newValue)) return oldValue; else if (parseFloat(newValue) < 0) return oldValue; else return newValue;
	});
	tableColumnModel.setCellEditorFactory(8, celleditorNumber);
		
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandSeleccionar.setEnabled(bool);
			menu.memorizar([commandSeleccionar]);
		});
		
/*
		tbl.addListener("focus", function(e){
			var t = e.getTarget();
			if (t.getTableModel().getRowCount() > 0) {
				var i = t.getFocusedRow();
				t.getSelectionModel().setSelectionInterval(i, i);
			}
		});
		tbl.addListener("blur", function(e){e.getTarget().resetSelection();});
*/		
		tbl.addListener("cellDbltap", function(e){
			commandSeleccionar.fireDataEvent("execute", null);
		});
		tbl.addListener("dataEdited", function(e){
			var data = e.getData();
			if (data.value != data.oldValue) {
				var rowData = tableModel.getRowData(data.row);
				rowData.cantidad = data.value;
			}
		});
		
		
		
	var btnAceptar = new qx.ui.form.Button("Agregar");
	btnAceptar.addListener("execute", function(e){
		this.fireDataEvent("aceptado", tableModel);
		txtBuscar.setValue("");
		functionKeyUp();
		txtBuscar.focus();
	}, this);
	this.add(btnAceptar, {left: 320, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cerrar");
	btnCancelar.addListener("execute", function(e){
		this.hide();
	}, this);
	this.add(btnCancelar, {left: 520, bottom: 0})

		

		
		

				
		this.add(tbl, {left: 0, top: 35, right: 0, bottom: 35});
		tbl.setContextMenu(menu);

		
	txtBuscar.setTabIndex(1);
	tbl.setTabIndex(2);
	btnAceptar.setTabIndex(3);
	btnCancelar.setTabIndex(4);
	
		
	

	
		
	},
	members : 
	{
		id_fabrica: null
	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});