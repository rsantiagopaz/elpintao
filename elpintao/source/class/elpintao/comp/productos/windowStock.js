qx.Class.define("elpintao.comp.productos.windowStock",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);
		
		this.set({
			caption: "Asignar stock",
			width: 1020,
			height: 570,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		var aux = slbFabrica.getChildren();
		for (var i in aux) {
			if (aux[i].getModel().get("id_fabrica")=="1") {
				slbFabrica.setSelection([aux[i]]);
				break;
			}
		}
		txtBuscar.focus();
	});
		
	
	var application = qx.core.Init.getApplication();
	var contexto = this;
	var id_fabrica = null;
	var windowProducto = null;
	
	var functionBuscarDescrip = function() {
		var texto = txtBuscar.getValue().trim();
		
		tbl.setFocusedCell();
		tableModel.setDataAsMapArray([], true);

		if (texto.length >= 3) {
			var p = {};
			p.id_fabrica = id_fabrica;
			p.descrip = texto;
			var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
			rpc.callAsync(function(resultado, error, id){
				for (var x in resultado) resultado[x].adicionar = 0;
				tableModel.setDataAsMapArray(resultado, true);
				if (resultado.length > 0) tbl.setFocusedCell(6, 0, true); else tbl.setFocusedCell();
			}, "buscar_productos", p);
		}
	}
	
	var slbFabrica = this.slbFabrica = new componente.general.ramon.ui.selectbox.SelectBox();
	var controllerFabrica = new qx.data.controller.List(null, slbFabrica, "descrip");
	application.objFabrica.store.bind("model", controllerFabrica, "model");
	slbFabrica.addListener("changeSelection", function(e){
		id_fabrica = e.getData()[0].getModel().get("id_fabrica");

		functionBuscarDescrip();
	});
	this.add(slbFabrica, {left: 50, top: 0});
	this.add(new qx.ui.basic.Label("Fábrica:"), {left: 0, top: 3});
	
	
	
	
	var txtBuscar = this.txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setLiveUpdate(true);
	txtBuscar.setWidth(300);
	txtBuscar.setPlaceholder("Buscar");

	
	txtBuscar.addListener("keyup", function(e){
		if (tbl.isEditing()) tbl.cancelEditing();

		if (e.getKeyIdentifier()=="Down") {
			tbl.focus();
		} else if (e.getKeyIdentifier()=="Enter") {
			var texto = txtBuscar.getValue().trim();
			if (texto!="") {
				var p = {};
				p.cod_barra = texto;
				var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
				rpc.callAsync(function(resultado, error, id){
					for (var x in resultado) resultado[x].adicionar = 0;
					tableModel.setDataAsMapArray(resultado, true);
					if (resultado.length > 0) {
						tbl.setFocusedCell(6, 0, true);
						if (resultado.length == 1) {
							tbl.focus();
							tbl.startEditing();
						}
					} else tbl.setFocusedCell();
				}, "buscar_productos", p);
			} else {
				tbl.setFocusedCell();
				tableModel.setDataAsMapArray([], true);			
			}
		} else {
			functionBuscarDescrip();
		}
	}, this);

	this.add(txtBuscar, {left: 240, top: 0});
	this.add(new qx.ui.basic.Label("Buscar:"), {left: 200, top: 3});
	
	

	var commandSeleccionar = new qx.ui.command.Command("F2");
	commandSeleccionar.setEnabled(false);
	commandSeleccionar.addListener("execute", function(e) {
		tbl.setFocusedCell(6, tbl.getFocusedRow(), true);
		tbl.startEditing();
	}, this);
	
	var commandCodBarra = new qx.ui.command.Command("F3");
	commandCodBarra.setEnabled(false);
	commandCodBarra.addListener("execute", function(e) {
		tbl.setFocusedCell(5, tbl.getFocusedRow(), true);
		tbl.startEditing();
	}, this);
	
		
	var menu = new componente.general.ramon.ui.menu.Menu();
	
	menu.addListener("appear", function(e){
		menu.setZIndex(this.getZIndex() + 1);
	}, this);
	var btnSeleccionar = new qx.ui.menu.Button("Adicionar", null, commandSeleccionar);
	var btnCodBarra = new qx.ui.menu.Button("Cod.barra", null, commandCodBarra);
	menu.add(btnSeleccionar);
	menu.add(btnCodBarra);
	menu.memorizar();
	
	
	
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Fábrica", "Producto", "Capacidad", "U", "Color", "Cod.barra", "Adicionar", "Stock"], ["fabrica", "producto", "capacidad", "unidad", "color", "cod_barra", "adicionar", "stock"]);
		tableModel.setColumnEditable(5, true);
		tableModel.setColumnEditable(6, true);


		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.setShowCellFocusIndicator(true);
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		tbl.edicion="";
		//tbl.edicion = "desplazamiento_vertical";

		
		var tableColumnModel = tbl.getTableColumnModel();
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"36%", minWidth:100});
		resizeBehavior.set(2, {width:"6%", minWidth:100});
		resizeBehavior.set(3, {width:"3%", minWidth:100});
		resizeBehavior.set(4, {width:"15%", minWidth:100});
		resizeBehavior.set(5, {width:"13%", minWidth:100});
		resizeBehavior.set(6, {width:"8%", minWidth:100});
		resizeBehavior.set(7, {width:"8%", minWidth:100});
		

	var celleditorString = new qx.ui.table.celleditor.TextField();
	celleditorString.setValidationFunction(function(newValue, oldValue){
		return newValue.trim();
	});
	tableColumnModel.setCellEditorFactory(5, celleditorString);
	
	var celleditorNumber = new qx.ui.table.celleditor.TextField();
	celleditorNumber.setValidationFunction(function(newValue, oldValue){
		newValue = newValue.trim();
		if (newValue=="") return oldValue;
		else if (isNaN(newValue)) return oldValue; else return newValue;
	});
	tableColumnModel.setCellEditorFactory(6, celleditorNumber);
		
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandSeleccionar.setEnabled(bool);
			commandCodBarra.setEnabled(bool);
			menu.memorizar([commandSeleccionar, commandCodBarra]);
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
				var p = {id_producto_item: rowData.id_producto_item};
				if (data.col == 5) {
					p.cod_barra = data.value;
				} else {
					p.adicionar = data.value;
					p.stock = rowData.stock;
					rowData.stock += p.adicionar;
					
					tableModel.setValueById("adicionar", data.row, 0);
					tableModel.setValueById("stock", data.row, rowData.stock);
				}
				var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
				rpc.callAsync(function(resultado, error, id){
					txtBuscar.focus();
					txtBuscar.selectAllText();
				}, "asignar_stock", p);
			}
		});
		
		
		this.add(tbl, {left: 0, top: 35, right: 0, bottom: 0});
		tbl.setContextMenu(menu);

		
	var btnNuevoProducto = new qx.ui.form.Button("Anotar nuevo producto...");
	btnNuevoProducto.addListener("execute", function(e){
		if (windowProducto == null) {
			windowProducto = new elpintao.comp.mensajes.windowProducto();
			windowProducto.setModal(true);
			windowProducto.addListener("close", function(e){
				windowProducto.destroy();
				windowProducto = null;
			})
			application.getRoot().add(windowProducto);
			windowProducto.center();
			windowProducto.open();
		} else {
			windowProducto.getLayoutParent().getWindowManager().bringToFront(windowProducto);
		}
	});
	
	//this.add(btnNuevoProducto, {left: 700, top: 0});
		
	slbFabrica.setTabIndex(1);
	txtBuscar.setTabIndex(2);
	tbl.setTabIndex(3);
	btnNuevoProducto.setTabIndex(4);
	
		
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