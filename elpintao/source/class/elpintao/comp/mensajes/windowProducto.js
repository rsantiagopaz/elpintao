qx.Class.define("elpintao.comp.mensajes.windowProducto",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);
		
		this.set({
			caption: "Anotar nuevos productos",
			width: 800,
			height: 470,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		
	this.addListenerOnce("appear", function(e){
		tbl.focus();
		commandAgregar.execute();
	});
		
	
	var application = qx.core.Init.getApplication();
	
	var commandAgregar = new qx.ui.command.Command("Insert");
	commandAgregar.addListener("execute", function(e){
		btnAceptar.setEnabled(true);
		tableModel.addRowsAsMapArray([{fabrica: "", descrip: "", capacidad: 0, color: "", unidad: "", cod_interno: "", cod_externo: "", cod_barra: ""}], null, true);
		tbl.setFocusedCell(0, tableModel.getRowCount()-1, true);
		tbl.startEditing();
	});
	var commandEditar = new qx.ui.command.Command("F2");
	commandEditar.setEnabled(false);
	commandEditar.addListener("execute", function(e){
		tbl.startEditing();
	});
	
	
	var menu = new componente.general.ramon.ui.menu.Menu();
	var btnAgregar = new qx.ui.menu.Button("Agregar item", null, commandAgregar);
	var btnCambiar = new qx.ui.menu.Button("Editar", null, commandEditar);
	var btnEliminar = new qx.ui.menu.Button("Eliminar");
	btnEliminar.setEnabled(false);
	btnEliminar.addListener("execute", function(e){
		var focusedRow = tbl.getFocusedRow();
	});

	menu.add(btnAgregar);
	menu.addSeparator();
	menu.add(btnCambiar);
	menu.add(btnEliminar);
	menu.memorizar();
	menu.desactivar();

		
		
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Fabrica", "Descripción", "Capacidad", "Color", "Unidad", "Cod.interno", "Cod.externo", "Cod.barra"], ["fabrica", "descrip", "capacidad", "color", "unidad", "cod_interno", "cod_externo", "cod_barra"]);
		tableModel.setEditable(true);

		
		var tbl = this._tbl = new componente.general.ramon.ui.table.Table(tableModel);
		tbl.setWidth(685);
		tbl.setHeight(200);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.setShowCellFocusIndicator(true);
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		
		var tableColumnModel = tbl.getTableColumnModel();

		tableColumnModel.setColumnWidth(0, 75);
		tableColumnModel.setColumnWidth(1, 150);
		tableColumnModel.setColumnWidth(2, 75);
		tableColumnModel.setColumnWidth(3, 75);
		tableColumnModel.setColumnWidth(4, 75);
		tableColumnModel.setColumnWidth(5, 75);
		tableColumnModel.setColumnWidth(6, 75);
		tableColumnModel.setColumnWidth(7, 75);

		
		var celleditorString = new qx.ui.table.celleditor.TextField();
		celleditorString.setValidationFunction(function(newValue, oldValue){
			return newValue.trim();
		});
		tableColumnModel.setCellEditorFactory(0, celleditorString);
		tableColumnModel.setCellEditorFactory(1, celleditorString);
		tableColumnModel.setCellEditorFactory(3, celleditorString);
		tableColumnModel.setCellEditorFactory(4, celleditorString);
		tableColumnModel.setCellEditorFactory(5, celleditorString);
		tableColumnModel.setCellEditorFactory(6, celleditorString);
		tableColumnModel.setCellEditorFactory(7, celleditorString);

		
		var celleditorNumber = new qx.ui.table.celleditor.TextField();
		celleditorNumber.setValidationFunction(function(newValue, oldValue){
			newValue = newValue.trim();
			if (newValue=="") return oldValue;
			else if (isNaN(newValue)) return oldValue; else return newValue;
		});
		tableColumnModel.setCellEditorFactory(2, celleditorNumber);
		
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandEditar.setEnabled(bool);
			btnEliminar.setEnabled(bool);
			menu.memorizar([commandEditar, btnEliminar]);
		});
		
		tbl.setContextMenu(menu);

		
		
		this.add(tbl, {left: 0, top: 0, right: 0, bottom: 40});
		
		tbl.addListener("dataEdited", function(e){

		});
		
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		var p = {};
		p.model = {id_usuario_de: 0, usuario_de: "Usuario", id_usuario_para: 0, usuario_para: "", asunto: "Pedido de alta de productos"};
		p.tabla = tableModel.getDataAsMapArray();
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
		try {
			var resultado = rpc.callSync("anotar_producto", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		application.timerTransmision.fireEvent("interval");
		
		btnCancelar.execute();
	}, this);
	this.add(btnAceptar, {left: 170, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.close();
	}, this);
	this.add(btnCancelar, {left: 370, bottom: 0})
	

		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});