qx.Class.define("elpintao.comp.remitos.windowRemito",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (rowRemito, emitir)
	{
	this.base(arguments);
	
	this.set({
		width: 800,
		height: 600,
		showMinimize: false,
		showMaximize: false
	});
	

	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		slbSucursal.focus();
	});
	
	var application = qx.core.Init.getApplication();
	var contexto = this;
	
	var id_remito = ((rowRemito==null) ? "0": ((emitir) ? rowRemito.id_remito_emi : rowRemito.id_remito_rec));
	var id_sucursal = ((rowRemito==null) ? "0": ((emitir) ? rowRemito.id_sucursal_para : rowRemito.id_sucursal_de));

	var slbSucursal = new qx.ui.form.SelectBox();
	var listItem;
	for (var x in application.arraySucursales) {
		if (application.arraySucursales[x].id_sucursal != application.rowParamet.id_sucursal) {
			listItem = new qx.ui.form.ListItem(application.arraySucursales[x].descrip, null, application.arraySucursales[x].id_sucursal);
			slbSucursal.add(listItem);
			if (application.arraySucursales[x].id_sucursal==id_sucursal) slbSucursal.setSelection([listItem]);
		}
	}
	this.add(slbSucursal, {left: 100 , top: 0});
	

	var txtDestino = new qx.ui.form.TextField("");
	txtDestino.setWidth(300);
	txtDestino.setEnabled(false);
	txtDestino.addListener("blur", function(e){
		txtDestino.setValue(txtDestino.getValue().trim());
	});
	this.add(txtDestino, {left: 340 , top: 0});
	
	
	var rbt1 = new qx.ui.form.RadioButton(((emitir) ? "Para sucursal: " : "De sucursal: "));
	rbt1.addListener("changeValue", function(e){
		var data = e.getData();
		slbSucursal.setEnabled(data);
		txtDestino.setEnabled(! data);
	});
	var rbt2 = new qx.ui.form.RadioButton(((emitir) ? "Para: " : "De: "));

	var mgr = new qx.ui.form.RadioGroup();
	mgr.add(rbt1, rbt2);
	
	this.add(rbt1, {left: 0 , top: 3});
	this.add(rbt2, {left: 280 , top: 3});
	

	
	var txtNr1 = new qx.ui.form.TextField("0");
	txtNr1.setEnabled(false);
	txtNr1.setWidth(40);
	txtNr1.setMaxLength(4);
	txtNr1.setFilter(/[0-9]/);
	txtNr1.addListener("blur", function(e){
		var aux = txtNr1.getValue();
		if (aux=="") aux = 0; else aux = parseFloat(aux);
		txtNr1.setValue(String(aux));
	})
	
	
	var txtNr2 = new qx.ui.form.TextField("0");
	txtNr2.setEnabled(false);
	txtNr2.setWidth(60);
	txtNr2.setMaxLength(8);
	txtNr2.setFilter(/[0-9]/);
	txtNr2.addListener("blur", function(e){
		var aux = txtNr2.getValue();
		if (aux=="") aux = 0; else aux = parseFloat(aux); 
		txtNr2.setValue(String(aux));
	})
	


	
	
	
	//Menu de contexto Detalle
	
	var commandNuevoDetalle = new qx.ui.command.Command("Insert");
	commandNuevoDetalle.addListener("execute", function(){
		windowProducto.center();
		windowProducto.open();
	});
	
	var menutblDetalle = new componente.general.ramon.ui.menu.Menu();
	var btnNuevoDetalle = new qx.ui.menu.Button("Alta item...", null, commandNuevoDetalle); 
	var btnEliminarDetalle = new qx.ui.menu.Button("Eliminar item");
	btnEliminarDetalle.setEnabled(false);
	btnEliminarDetalle.addListener("execute", function(e){
		tableModelDetalle.removeRows(tblDetalle.getFocusedRow(), 1);
		tblDetalle.focus();
	});
	menutblDetalle.add(btnNuevoDetalle);
	menutblDetalle.addSeparator();
	menutblDetalle.add(btnEliminarDetalle);
	menutblDetalle.memorizar();
	commandNuevoDetalle.setEnabled(false);
	
	
	
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
	tblDetalle.setAdditionalStatusBarText(" ");
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);

      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"12%", minWidth:100});
		resizeBehavior.set(1, {width:"44%", minWidth:100});
		resizeBehavior.set(2, {width:"11%", minWidth:100});
		resizeBehavior.set(3, {width:"6%", minWidth:100});
		resizeBehavior.set(4, {width:"17%", minWidth:100});
		resizeBehavior.set(5, {width:"10%", minWidth:100});

		
	
	var selectionModel = tblDetalle.getSelectionModel();
	selectionModel.addListener("changeSelection", function(e){
		var bool = ! selectionModel.isSelectionEmpty();
		btnEliminarDetalle.setEnabled(bool);
		menutblDetalle.memorizar([btnEliminarDetalle]);
	});
	
	tblDetalle.setContextMenu(menutblDetalle);
	
	if (!emitir && (id_remito=="0" || rowRemito.tipo == "0")) {
		this.add(txtNr1, {left: 100, top: 30});
		this.add(txtNr2, {left: 150, top: 30});
	
		this.add(new qx.ui.basic.Label("-"), {left: 143, top: 33});
		this.add(new qx.ui.basic.Label("Nro.remito: "), {left: 18, top: 33});
		
		this.add(tblDetalle, {left: 0, top: 60, right: 0, bottom: 50});
	} else {
		this.add(tblDetalle, {left: 0, top: 30, right: 0, bottom: 50});
	}
	
	
	var windowProducto = new elpintao.comp.pedidos.windowProducto("Agregar items detalle", true);
	windowProducto.id_fabrica = "1";
	windowProducto.addListener("aceptado", function(e){
		var tableModel = e.getData();
	
		tblDetalle.resetSelection();
		
		var rowData;
		var rowBuscado;
		for (var x = 0; x < tableModel.getRowCount(); x++) {
			rowData = tableModel.getRowData(x);
			if (rowData.cantidad > 0) {
				rowBuscado = tblDetalle.buscar("id_producto_item", rowData.id_producto_item);
				if (rowBuscado == null) {
					//p.detalle.push(rowData);
					tableModelDetalle.addRowsAsMapArray([rowData], null, true);
					tblDetalle.setFocusedCell(0, tableModelDetalle.getRowCount() - 1, true)
				} else {
					rowBuscado.cantidad = rowBuscado.cantidad + rowData.cantidad;
					tableModelDetalle.setValueById("cantidad", tblDetalle.getFocusedRow(), rowBuscado.cantidad);
				}
			}
		}
	}, this);
	
	windowProducto.addListener("disappear", function(e){
		tblDetalle.focus();
	});
	
	windowProducto.setModal(true);
	application.getRoot().add(windowProducto);
	
	
	
	if (id_remito=="0") {
		this.setCaption(((emitir) ? "Nuevo remito emitido" : "Nuevo remito recibido"));
		if (!emitir) {
			txtNr1.setEnabled(true);
			txtNr2.setEnabled(true);
		}
		tblDetalle.setFocusedCell();
	} else {
		this.setCaption(((emitir) ? "Modificar remito emitido" : "Modificar remito recibido"));
		
		if (!emitir && rowRemito.tipo == "0") {
			txtNr1.setEnabled(true);
			txtNr2.setEnabled(true);
		}
		
		var aux = rowRemito.nro_remito.split("-");
		txtNr1.setValue(((isNaN(aux[0])) ? "0" : String(parseFloat(aux[0]))));
		txtNr2.setValue(((isNaN(aux[1])) ? "0" : String(parseFloat(aux[1]))));
		
		rbt2.setValue(id_sucursal=="0");
		txtDestino.setValue(rowRemito.destino);
		
		var p = {};
		p.emitir = emitir;
		p.id_remito = (emitir) ? rowRemito.id_remito_emi : rowRemito.id_remito_rec ;
		
		var rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
		try {
			var resultado = rpc.callSync("leer_remitos_detalle", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}

		
		tableModelDetalle.setDataAsMapArray(resultado, true);
		tblDetalle.setFocusedCell(0, 0, true);
		if ((emitir && rowRemito.tipo == "1") || (!emitir && rowRemito.tipo > "0")) {
			slbSucursal.setEnabled(false);
			rbt1.setEnabled(false);
			rbt2.setEnabled(false);
			txtDestino.setEnabled(false);
		}
	}
	
	
	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		txtDestino.setValid(true);
		txtNr1.setValid(true);
		txtNr2.setValid(true);
		
		if (rbt2.getValue() && txtDestino.getValue()=="") {
			txtDestino.setInvalidMessage("Debe ingresar nombre/razón social");
			txtDestino.setValid(false);
			txtDestino.focus();
		} else if ((!emitir && (id_remito=="0" || rowRemito.tipo == "0")) && txtNr1.getValue()=="0" && txtNr2.getValue()=="0") {
			txtNr1.setInvalidMessage("Debe ingresar un nro.remito válido");
			txtNr1.setValid(false);
			txtNr2.setInvalidMessage("Debe ingresar un nro.remito válido");
			txtNr2.setValid(false);
			txtNr1.focus();
		} else if (tableModelDetalle.getRowCount()==0) {
			dialog.Dialog.warning("Debe ingresar algun item al detalle", function(e){
				tblDetalle.focus();
			});
		} else {
			var p = {};
			p.id_remito = id_remito;
			if (!emitir && (id_remito=="0" || rowRemito.tipo == "0")) {
				p.nro_remito = qx.lang.String.pad(txtNr1.getValue(), 4, "0") + "-" + qx.lang.String.pad(txtNr2.getValue(), 8, "0");
			} else {
				p.nro_remito = (id_remito=="0") ? "" : rowRemito.nro_remito;
			}
			p.id_sucursal = ((rbt1.getValue()) ? slbSucursal.getModelSelection().getItem(0) : "0");
			p.destino = ((rbt1.getValue()) ? "" : txtDestino.getValue());
			p.detalle = tableModelDetalle.getDataAsMapArray();
			
			var rpc = new qx.io.remote.Rpc("services/", "comp.Remitos");
			try {
				var resultado = rpc.callSync(((emitir) ? "alta_modifica_remito_emi" : "alta_modifica_remito_rec"), p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			id_remito = resultado;
	
			this.fireDataEvent("aceptado", id_remito);
			btnCancelar.execute();
		}
	}, this);
	this.add(btnAceptar, {left: 270, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 470, bottom: 0})
	
	
	rbt1.setTabIndex(1);
	slbSucursal.setTabIndex(2);
	rbt2.setTabIndex(3);
	txtDestino.setTabIndex(4);
	txtNr1.setTabIndex(5);
	txtNr2.setTabIndex(6);
	tblDetalle.setTabIndex(7);
	btnAceptar.setTabIndex(8);
	btnCancelar.setTabIndex(9);
	
	
	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});