qx.Class.define("componente.elpintao.ramon.productos.windowProducto",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (id_arbol, id_producto, clasificacion)
	{
		this.base(arguments);
		
		this.set({
			caption: "Alta de producto",
			width: 710,
			height: 470,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		
	this.addListenerOnce("appear", function(e){
		if (boolAlta) {
			var aux = slbFabrica.getChildren();
			for (var i in aux) {
				if (aux[i].getModel().get("id_fabrica")=="1") {
					slbFabrica.setSelection([aux[i]]);
					break;
				}
			}
		}
		slbFabrica.focus();
	});
	
	componente.elpintao.ramon.Rutinas.crear_obj_base(["objFabrica", "objMoneda", "objColor", "objUnidad"]);
		
	
	
	var application = qx.core.Init.getApplication();
	var producto = null;
	var modelForm = null;
	var boolAlta = (id_producto == "0")
	var eliminados = [];
		

	this.setEnabled(false);
		
	var form = new qx.ui.form.Form();
	
	var menuFabrica = new componente.general.ramon.ui.menu.Menu();
	var btnABMFabrica = new qx.ui.menu.Button("ABM fábricas...");
	btnABMFabrica.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.parametros.windowFabricas();
		win.addListener("disappear", function(e){slbFabrica.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();	
	});
	menuFabrica.add(btnABMFabrica);
	menuFabrica.memorizar();
	btnABMFabrica.setEnabled(false);
	var slbFabrica = new componente.general.ramon.ui.selectbox.SelectBox();
	slbFabrica.setContextMenu(menuFabrica);
	var controllerFabrica = new qx.data.controller.List(null, slbFabrica, "descrip");
	application.objFabrica.store.bind("model", controllerFabrica, "model");
	form.add(slbFabrica, "Fábrica", null, "id_fabrica")
	slbFabrica.addListener("changeSelection", function(e){
		//txtDesc_fabrica.setValue(e.getData()[0].getModel().get("desc_fabrica"));
		lblDesc_fabrica.setValue("Descuento: " + e.getData()[0].getModel().get("desc_fabrica") + "%");
	});

	
	var lblDesc_fabrica = new qx.ui.basic.Label();
	this.add(lblDesc_fabrica, {left: 245, top: 45});
	

	var txtDescrip = new qx.ui.form.TextField("");
	txtDescrip.setRequired(true);
	txtDescrip.addListener("changeValue", function(e){
		var rowData;
		for (var i=0; i < tableModel.getRowCount(); i++) {
			rowData = tableModel.getRowData(i);
			rowData.modificado = true;
		}
	});
	txtDescrip.addListener("blur", function(e){
		txtDescrip.setValue(txtDescrip.getValue().trim());
		if (txtDescrip_ticket.getValue()=="") txtDescrip_ticket.setValue(txtDescrip.getValue().substr(0, 20));
	});
	form.add(txtDescrip, "Descripción", null, "descrip");
	
	
	var txtDescrip_ticket = new qx.ui.form.TextField("");
	txtDescrip_ticket.setMaxLength(20);
	form.add(txtDescrip_ticket, "Desc. tk", null, "descrip_ticket");

	
	var txtIva = new qx.ui.form.Spinner(0, 21, 100);
	form.add(txtIva, "I.V.A.%", null, "iva");


	var txtDesc_producto = new qx.ui.form.Spinner();
	form.add(txtDesc_producto, "Desc.produc.%", null, "desc_producto");


	var menuMoneda = new componente.general.ramon.ui.menu.Menu();
	var btnABMMoneda = new qx.ui.menu.Button("ABM monedas...");
	btnABMMoneda.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.parametros.windowMonedas();
		win.addListener("disappear", function(e){slbMoneda.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();		
	});
	menuMoneda.add(btnABMMoneda);
	menuMoneda.memorizar();
	btnABMMoneda.setEnabled(false);
	var slbMoneda = new componente.general.ramon.ui.selectbox.SelectBox();
	slbMoneda.setContextMenu(menuMoneda);
	var controllerMoneda = new qx.data.controller.List(null, slbMoneda, "descrip");

	controllerMoneda.setLabelOptions(
		{converter: function(label, model){
			if (model == null) {
				return label;
			} else { 
				return label + " (" + model.get("simbolo") + ")";
			}
		}
	});
	application.objMoneda.store.bind("model", controllerMoneda, "model");
	form.add(slbMoneda, "Moneda", null, "id_moneda")


	var formView = new qx.ui.form.renderer.Single(form);
	

	
	
	var l = formView.getLayout();
	for (var i=0; i < l.getRowCount(); i++) {
		l.getCellWidget(i, 1).setUserData("label", l.getCellWidget(i, 0));
	}

	//this.add(formView, {left: 10, top: 10})
	
	this.add(new qx.ui.basic.Label("Clasificación: "), {left: 10, top: 10});
	this.add(new qx.ui.basic.Label(clasificacion), {left: 105, top: 10});
	
	this.add(slbFabrica, {left: 90, top: 40});
	this.add(slbFabrica.getUserData("label"), {left: 10, top: 45});
	
	txtDesc_producto.setWidth(80);
	//this.add(txtDesc_producto, {left: 330, top: 40});
	//this.add(txtDesc_producto.getUserData("label"), {left: 245, top: 40});
	
	txtDescrip.setWidth(320);
	this.add(txtDescrip, {left: 90, top: 100});
	this.add(txtDescrip.getUserData("label"), {left: 10, top: 100});

	txtDescrip_ticket.setWidth(160);
	this.add(txtDescrip_ticket, {left: 90, top: 130});
	this.add(txtDescrip_ticket.getUserData("label"), {left: 10, top: 130});
	
	//slbUnidad.setWidth(80);
	this.add(slbMoneda, {left: 90, top: 70});
	this.add(slbMoneda.getUserData("label"), {left: 10, top: 75});
	
	txtIva.setWidth(80);
	this.add(txtIva, {left: 330, top: 70});
	this.add(txtIva.getUserData("label"), {left: 245, top: 75});
	
	
	var controllerForm = new qx.data.controller.Form(null, form);

	controllerForm.addBindingOptions("id_fabrica",
		{converter: function(data) {
			return application.objFabrica.indice[data];
		}},
		{converter: function(data) {
			return data.get("id_fabrica");
		}}
	);

	controllerForm.addBindingOptions("id_moneda",
		{converter: function(data) {
			return application.objMoneda.indice[data];
		}},
		{converter: function(data) {
			return data.get("id_moneda");
		}}
	);


	
	
	
	

	
	
	
	
	
	var commandAgregar = new qx.ui.command.Command("Insert");
	commandAgregar.addListener("execute", function(e){
		btnAceptar.setEnabled(true);
		//tableModel.addRowsAsMapArray([{id_producto_item: 0, capacidad: 0, id_color: "1", id_unidad: "1", precio_lista: 0.00, remarc_final: 0.00, desc_final: txtDesc_fabrica.getValue(), bonif_final: 0.00, remarc_mayorista: 0.00, desc_mayorista: txtDesc_fabrica.getValue(), bonif_mayorista: 0.00, comision_vendedor: 0.00, cod_interno: "", cod_externo: "", cod_barra: "", duracion: 0, alta: true}], null, true);
		tableModel.addRowsAsMapArray([{id_producto_item: 0, capacidad: 0, id_color: "1", id_unidad: "1", precio_lista: 0.00, remarc_final: 0.00, desc_final: 0.00, bonif_final: 0.00, remarc_mayorista: 0.00, desc_mayorista: 0, bonif_mayorista: 0.00, desc_lista: 0.00, comision_vendedor: 0.00, cod_interno: "", cod_externo: "", cod_barra: "", duracion: 0, alta: true}], null, true);
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
		var rowData = tableModel.getRowData(focusedRow); 
		if (rowData.id_producto_item != 0) eliminados.push(rowData.id_producto_item);
		
		tableModel.removeRows(focusedRow, 1, false);
		var rowCount = tableModel.getRowCount();
		if (rowCount - 1 >= focusedRow) {
			tbl.setFocusedCell(0, focusedRow, true);
			selectionModel.setSelectionInterval(focusedRow, focusedRow);
		} else if (rowCount==0) {
			selectionModel.resetSelection();
			tbl.setFocusedCell();
		} else {
			tbl.setFocusedCell(0, rowCount - 1, true);
			selectionModel.setSelectionInterval(rowCount - 1, rowCount - 1);
		}
	});
	var btnABMcolor = new qx.ui.menu.Button("ABM colores...");
	btnABMcolor.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.parametros.windowColores();
		win.addListener("disappear", function(e){tbl.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	var btnABMunidad = new qx.ui.menu.Button("ABM unidades...");
	btnABMunidad.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.parametros.windowUnidades();
		win.addListener("disappear", function(e){tbl.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	menu.add(btnAgregar);
	menu.addSeparator();
	menu.add(btnCambiar);
	menu.add(btnEliminar);
	menu.addSeparator();
	menu.add(btnABMcolor);
	menu.add(btnABMunidad);
	menu.memorizar();
	menu.desactivar();

		
		
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Capacidad", "Color", "Unidad", "Precio lista", "Remarc.CF.", "Desc.CF.", "Remarc.may.", "Desc.may.", "Comisión", "Cod.interno", "Cod.externo", "Cod.barra", "Duración"], ["capacidad", "id_color", "id_unidad", "precio_lista", "remarc_final", "desc_final", "remarc_mayorista", "desc_mayorista", "comision_vendedor", "cod_interno", "cod_externo", "cod_barra", "duracion"]);
		tableModel.setEditable(true);

		
		var tbl = this._tbl = new componente.general.ramon.ui.table.Table(tableModel);
		tbl.setWidth(685);
		tbl.setHeight(200);
		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.setShowCellFocusIndicator(true);
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();
		
		var tableColumnModel = tbl.getTableColumnModel();

		tableColumnModel.setColumnWidth(0, 65);
		tableColumnModel.setColumnWidth(1, 150);
		tableColumnModel.setColumnWidth(2, 65);
		tableColumnModel.setColumnWidth(3, 75);
		tableColumnModel.setColumnWidth(4, 75);
		tableColumnModel.setColumnWidth(5, 75);
		tableColumnModel.setColumnWidth(6, 78);
		tableColumnModel.setColumnWidth(7, 75);
		tableColumnModel.setColumnWidth(8, 75);
		tableColumnModel.setColumnWidth(12, 75);
		
		tableColumnModel.setColumnVisible(3, false);
		tableColumnModel.setColumnVisible(4, false);
		tableColumnModel.setColumnVisible(5, false);
		tableColumnModel.setColumnVisible(6, false);
		tableColumnModel.setColumnVisible(7, false);
		tableColumnModel.setColumnVisible(8, false);
		
		
		var celleditorString = new qx.ui.table.celleditor.TextField();
		celleditorString.setValidationFunction(function(newValue, oldValue){
			return newValue.trim();
		});
		tableColumnModel.setCellEditorFactory(9, celleditorString);
		tableColumnModel.setCellEditorFactory(10, celleditorString);
		tableColumnModel.setCellEditorFactory(11, celleditorString);
		
		var celleditorNumber = new qx.ui.table.celleditor.TextField();
		celleditorNumber.setValidationFunction(function(newValue, oldValue){
			newValue = newValue.trim();
			if (newValue=="") return oldValue;
			else if (isNaN(newValue)) return oldValue; else return newValue;
		});
		tableColumnModel.setCellEditorFactory(0, celleditorNumber);
		tableColumnModel.setCellEditorFactory(3, celleditorNumber);
		tableColumnModel.setCellEditorFactory(4, celleditorNumber);
		tableColumnModel.setCellEditorFactory(5, celleditorNumber);
		tableColumnModel.setCellEditorFactory(6, celleditorNumber);
		tableColumnModel.setCellEditorFactory(7, celleditorNumber);
		tableColumnModel.setCellEditorFactory(8, celleditorNumber);
		tableColumnModel.setCellEditorFactory(12, celleditorNumber);
		
		
		var cellrendererColor = new qx.ui.table.cellrenderer.Replace();
		cellrendererColor.setReplaceFunction(function(newValue){
			return application.objColor.indice[newValue].get("descrip");
		});
		tableColumnModel.setDataCellRenderer(1, cellrendererColor);
		
		//var celleditorColor = new qx.ui.table.celleditor.ComboBox();
		var celleditorColor = new componente.general.ramon.ui.celleditor.ComboBox();
		
	
		
		
		celleditorColor.setValidationFunction(function(newValue, oldValue){
			return application.objColor.indice[newValue].get("id_color");
		});
		tableColumnModel.setCellEditorFactory(1, celleditorColor);
		
		var functionActualizarColores = function(e){
			var aux = [];
			var model = application.objColor.store.getModel();
			for (var i = 0; i < model.length; i++) {
				aux.push(model.getItem(i).get("descrip"));
			}
			celleditorColor.setListData(aux);
		};
		var listenerColor = application.objColor.store.addListener("loaded", function(e){
			functionActualizarColores();
		});
		this.registrarListener(application.objColor.store, listenerColor);
		functionActualizarColores();
		
		
		
		var cellrendererUnidad = new qx.ui.table.cellrenderer.Replace();
		cellrendererUnidad.setReplaceFunction(function(newValue){
			return application.objUnidad.indice[newValue].get("descrip");
		});
		tableColumnModel.setDataCellRenderer(2, cellrendererUnidad);
		
		//var celleditorUnidad = new qx.ui.table.celleditor.SelectBox();
		var celleditorUnidad = new componente.general.ramon.ui.celleditor.ComboBox();
		celleditorUnidad.setValidationFunction(function(newValue, oldValue){
			return application.objUnidad.indice[newValue].get("id_unidad");
		});
		tableColumnModel.setCellEditorFactory(2, celleditorUnidad);
		
		var functionActualizarUnidades = function(e){
			var aux = [];
			var model = application.objUnidad.store.getModel();
			for (var i = 0; i < model.length; i++) {
				aux.push(model.getItem(i).get("descrip"));
			}
			celleditorUnidad.setListData(aux);
		};
		var listenerUnidad = application.objUnidad.store.addListener("loaded", function(e){
			functionActualizarUnidades();
		});
		this.registrarListener(application.objUnidad.store, listenerUnidad);
		functionActualizarUnidades();

		
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandEditar.setEnabled(bool);
			btnEliminar.setEnabled(bool);
			menu.memorizar([commandEditar, btnEliminar]);
		});
		
		tbl.setContextMenu(menu);

		
		
		this.add(tbl, {left: 0, top: 170});
		
		tbl.addListener("dataEdited", function(e){
			var focusedRow = tbl.getFocusedRow();
			var original = tableModel.getRowData(focusedRow);
			var actual = tableModel.getRowDataAsMap(focusedRow);
			actual.id_producto_item = original.id_producto_item;
			actual.alta = original.alta;
			actual.modificado = true;
			tableModel.setRowsAsMapArray([actual], focusedRow, true);
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
	
	
	
	
	
	
	
	
	
	



	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		if (form.validate()) {
			if (tableModel.getRowCount() > 0) {
				btnAceptar.setEnabled(false);
				btnCancelar.setEnabled(false);
				var model = qx.util.Serializer.toNativeObject(modelForm);
				model.id_producto = id_producto;
				model.id_arbol = id_arbol;
				
				var aux;
				var serializer = (producto==null) ? null : qx.lang.Json.parse(producto.model.serializer);
				var items = {altas: [], modificados: [], eliminados: eliminados};
				for (var i=0; i < tableModel.getRowCount(); i++) {
					var row = tableModel.getRowData(i);
					if (row.alta) {
						aux = [clasificacion, model.descrip, application.objFabrica.indice[model.id_fabrica].get("descrip"), application.objColor.indice[row.id_color].get("descrip")];
						row.busqueda = qx.lang.Json.stringify(aux);
						delete row.alta;
						delete row.modificado;
						
						if (serializer != null && serializer.agrupar && (serializer.colores[row.id_color] || serializer.colores[row.id_color] == null)) {
							var itemaux;
							for (var item in producto.items) {
								itemaux = producto.items[item];
								if (row.capacidad == itemaux.capacidad && row.id_unidad == itemaux.id_unidad && serializer.colores[itemaux.id_color]) {
									row.precio_lista = itemaux.precio_lista;
									row.remarc_final = itemaux.remarc_final;
									row.remarc_mayorista = itemaux.remarc_mayorista;
									row.desc_final = itemaux.desc_final;
									row.desc_mayorista = itemaux.desc_mayorista;
									row.bonif_final = itemaux.bonif_final;
									row.bonif_mayorista = itemaux.bonif_mayorista;
									row.desc_lista = itemaux.desc_lista;
									row.comision_vendedor = itemaux.comision_vendedor;
									
									break;
								}
							}
						}
						
						items.altas.push(row);
					} else if (row.modificado) {
						aux = [clasificacion, model.descrip, application.objFabrica.indice[model.id_fabrica].get("descrip"), application.objColor.indice[row.id_color].get("descrip")]; 
						row.busqueda = qx.lang.Json.stringify(aux);
						delete row.alta;
						delete row.modificado;
						items.modificados.push(row);
					}
				}
				
				var p = {};
				p.model = model;
				p.items = items;
				
				var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
				try {
					var resultado = rpc.callSync("alta_modifica_producto", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				this.id_producto = resultado;
				this.fireDataEvent("aceptado", resultado);
				this.destroy();
			} else {
				dialog.Dialog.alert("Debe agregar por lo menos 1 item a la tabla.", function(e){tbl.focus();});
			}
		} else {
			var items = form.getItems();
			for (var item in items) {
				if (!items[item].isValid()) {
					items[item].focus();
					break;
				}
			}
		}
	}, this);
	this.add(btnAceptar, {left: 170, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		var contexto = this;
		dialog.Dialog.confirm("Cerrar ventana sin guardar datos?", function(e){
			if (e) contexto.destroy(); else btnCancelar.focus();
		});
	}, this);
	this.add(btnCancelar, {left: 370, bottom: 0})
	
	
	slbFabrica.setTabIndex(1);
	txtDesc_producto.setTabIndex(2);
	slbMoneda.setTabIndex(3);
	txtIva.setTabIndex(4);
	txtDescrip.setTabIndex(5);
	txtDescrip_ticket.setTabIndex(6);
	tbl.setTabIndex(7);
	

	
	//slbFabrica.focus();
	this.setEnabled(true);
	if (boolAlta) {
		modelForm = controllerForm.createModel(true);
	} else {
		this.setCaption("Modificación de producto");
		txtIva.setEnabled(false);
		
		var p = {};
		p.id_producto = id_producto;
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
		try {
			var resultado = rpc.callSync("leer_producto", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}

		producto = resultado;
		
		modelForm = qx.data.marshal.Json.createModel(resultado.model);
		controllerForm.setModel(modelForm);
		tableModel.setDataAsMapArray(resultado.items, true);
		tbl.setFocusedCell(0, 0, true);
	}
	tableModel.sortByColumn(0, true);

	

	
	

	var commandEscape = new qx.ui.command.Command("Escape");
	this.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);
	commandEscape.addListener("execute", function(e){
		if (! tbl.isEditing()) {
			btnCancelar.execute();
		}  else {
			tbl.cancelEditing();
			tbl.focus();
		}
	});

	
	
	
		


	
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});