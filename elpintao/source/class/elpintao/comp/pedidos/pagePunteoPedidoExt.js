qx.Class.define("elpintao.comp.pedidos.pagePunteoPedidoExt",
{
	extend : qx.ui.tabview.Page,
	construct : function (parametro)
	{
	this.base(arguments);
	
	this.setLabel(parametro.label);
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
	
	this.addListenerOnce("appear", function(e){
		txtNr1.focus();
		txtNr1.selectAllText();
	});
	
	
	
	var application = qx.core.Init.getApplication();
	var contexto = this;
	
	
	
	
	
	
	var txtNr1 = new qx.ui.form.TextField("0");
	//txtNr1.setEnabled(false);
	txtNr1.setWidth(40);
	txtNr1.setMaxLength(4);
	txtNr1.setFilter(/[0-9]/);
	txtNr1.addListener("blur", function(e){
		var aux = txtNr1.getValue();
		if (aux=="") aux = 0; else aux = parseFloat(aux);
		txtNr1.setValue(String(aux));
	})
	
	
	var txtNr2 = new qx.ui.form.TextField("0");
	//txtNr2.setEnabled(false);
	txtNr2.setWidth(60);
	txtNr2.setMaxLength(8);
	txtNr2.setFilter(/[0-9]/);
	txtNr2.addListener("blur", function(e){
		var aux = txtNr2.getValue();
		if (aux=="") aux = 0; else aux = parseFloat(aux); 
		txtNr2.setValue(String(aux));
	})
	
	this.add(txtNr1, {left: 100, top: 0});
	this.add(txtNr2, {left: 150, top: 0});
	
	this.add(new qx.ui.basic.Label("-"), {left: 143, top: 3});
	this.add(new qx.ui.basic.Label("Nro.remito: "), {left: 18, top: 3});
	
	
	
	
	
	//Menu de contexto Detalle
	
	var commandNuevoDetalle = new qx.ui.command.Command("Insert");
	commandNuevoDetalle.addListener("execute", function(){
		windowProducto.id_fabrica = parametro.id_fabrica;
		windowProducto.center();
		windowProducto.open();
	});
	var commandEditarDetalle = new qx.ui.command.Command("F2");
	commandEditarDetalle.setEnabled(false);
	commandEditarDetalle.addListener("execute", function(e) {
		tblPedido.setFocusedCell(5, tblPedido.getFocusedRow(), true);
		tblPedido.startEditing();
	});
	
	var menutblDetalle = new componente.general.ramon.ui.menu.Menu();
	var btnNuevoDetalle = new qx.ui.menu.Button("Agregar item...", null, commandNuevoDetalle); 
	var btnEditarDetalle = new qx.ui.menu.Button("Editar item", null, commandEditarDetalle);
	var btnGuardarDetalle = new qx.ui.menu.Button("Guardar detalle recibido");
	btnGuardarDetalle.addListener("execute", function(e){
		var rowData;
		var bandera = false;
		var p = {};
		p.id_pedido_ext = parametro.id_pedido_ext;
		p.detalle = [];
		
		//alert(qx.lang.Json.stringify(parametro, null, 2));
		
		txtNr1.setValid(true);
		txtNr2.setValid(true);
		
		if (txtNr1.getValue()=="0" && txtNr2.getValue()=="0") {
			txtNr1.setInvalidMessage("Debe ingresar un nro.remito válido");
			txtNr1.setValid(false);
			txtNr2.setInvalidMessage("Debe ingresar un nro.remito válido");
			txtNr2.setValid(false);
			txtNr1.focus();
		} else {
			
			p.nro_remito = qx.lang.String.pad(txtNr1.getValue(), 4, "0") + "-" + qx.lang.String.pad(txtNr2.getValue(), 8, "0");
			p.id_fabrica = parametro.id_fabrica;
		
			for (var x = 0; x < tableModelPedido.getRowCount(); x++) {
				rowData = tableModelPedido.getRowData(x);
				if (rowData.total > 0) {
					p.detalle.push(rowData);
					bandera = true;
				}
			}
	
			if (bandera) {
				(new dialog.Confirm({
					"message"     : "Desea guardar el pedido recibido?",
					"callback"    : qx.lang.Function.bind(function(e){
										if (e) {
											var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
											try {
												var resultado = rpc.callSync("recibir_pedido", p);
											} catch (ex) {
												alert("Sync exception: " + ex);
											}
									
											application.functionActualizarPedidoExt(parametro.id_pedido_ext);
											this.fireEvent("close");
										}
									}, this),
					"context"     : null,
					"image"       : "icon/48/status/dialog-questionmark.png"
				})).show();
				
				
				
				/*
				var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
				try {
					var resultado = rpc.callSync("recibir_pedido", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
		
				application.functionActualizarPedidoExt(parametro.id_pedido_ext);
				this.fireEvent("close");
				*/
			} else {
				dialog.Dialog.warning("Debe ingresar alguna cantidad recibida.", function(e){tblPedido.focus();});
			}
		}
	}, this);
	menutblDetalle.add(btnNuevoDetalle);
	menutblDetalle.add(btnEditarDetalle);

	menutblDetalle.addSeparator();
	menutblDetalle.add(btnGuardarDetalle);
	menutblDetalle.memorizar();
	commandNuevoDetalle.setEnabled(false);
	btnGuardarDetalle.setEnabled(false);
	
	

	//Tabla

	var tableModelPedido = new qx.ui.table.model.Simple();
	tableModelPedido.setColumns(["Producto", "Color", "Capacidad", "U", "Pedido", "Ingresar", "Sumado", "Restado", "Total"], ["producto", "color", "capacidad", "unidad", "cantidad", "ingresar", "sumado", "restado", "total"]);
	//tableModelPedido.setColumns(["Fecha", "Fábrica"], ["fecha", "id_fabrica"]);
	//tableModelPedido.setEditable(true);
	tableModelPedido.setColumnSortable(0, false);
	tableModelPedido.setColumnSortable(1, false);
	tableModelPedido.setColumnSortable(2, false);
	tableModelPedido.setColumnSortable(3, false);
	tableModelPedido.setColumnSortable(4, false);
	tableModelPedido.setColumnSortable(5, false);
	tableModelPedido.setColumnSortable(6, false);
	
	tableModelPedido.setColumnEditable(5, true);
	tableModelPedido.addListener("dataChanged", function(e){
		var rowCount = tableModelPedido.getRowCount();
		
		tblPedido.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
	});
	
	/*
	tableModelPedido.setSortMethods(0, function(row1, row2) {
		var resultado;
		if (row1[0] == row2[0]) {if (row1[3] == row2[3]) {if (row1[2] == row2[2]) {if (row1[1] == row2[1]) {resultado = 0;} else resultado = ((row1[1] > row2[1]) ? 1 : -1);} else resultado = ((row1[2] > row2[2]) ? 1 : -1);} else resultado = ((row1[3] > row2[3]) ? 1 : -1);} else resultado = ((row1[0] > row2[0]) ? 1 : -1);
		return resultado;
	});
	*/

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblPedido = new componente.general.ramon.ui.table.Table(tableModelPedido, custom);
	tblPedido.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblPedido.setShowCellFocusIndicator(true);
	tblPedido.toggleColumnVisibilityButtonVisible();
	//tblPedido.toggleStatusBarVisible();
	//tblPedido.edicion="desplazamiento_vertical";
	tblPedido.edicion="no";
	
	tblPedido.setContextMenu(menutblDetalle);
	
	tblPedido.addListener("cellDbltap", function(e) {
		commandEditarDetalle.execute();
	});
	
	
	var tableColumnModelPedido = tblPedido.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	
	var resizeBehavior = tableColumnModelPedido.getBehavior();
	resizeBehavior.set(0, {width:"47%", minWidth:100});
	resizeBehavior.set(1, {width:"20%", minWidth:100});
	resizeBehavior.set(2, {width:"11%", minWidth:100});
	resizeBehavior.set(3, {width:"3%", minWidth:100});
	//resizeBehavior.set(4, {width:"7%", minWidth:100});
	
	var celleditorNumber = new qx.ui.table.celleditor.TextField();
	celleditorNumber.setValidationFunction(function(newValue, oldValue){
		newValue = newValue.trim();
		if (newValue=="") return oldValue;
		else if (isNaN(newValue)) return oldValue; else return newValue;
	});
	tableColumnModelPedido.setCellEditorFactory(5, celleditorNumber);


	var selectionModelPedido = tblPedido.getSelectionModel();

	selectionModelPedido.addListener("changeSelection", function(e){
		commandEditarDetalle.setEnabled(!selectionModelPedido.isSelectionEmpty())
		menutblDetalle.memorizar([commandEditarDetalle]);
	});
	
	tblPedido.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value != data.oldValue) {
			var rowData = tableModelPedido.getRowData(data.row);
			if (data.value > 0) rowData.sumado = rowData.sumado + data.value;
			if (data.value < 0) rowData.restado = rowData.restado + data.value;
			rowData.total = rowData.total + data.value;
			rowData.ingresar = 0;
			tableModelPedido.setRowsAsMapArray([rowData], data.row, true, false);
		}
	});


	this.add(tblPedido, {left:0 , top: 50, right: 0, bottom: 0});
	
	this.add(new qx.ui.basic.Label("Detalle pedido:"), {left:0 , top: 30});
	
	

	
	
	var windowProducto = new elpintao.comp.pedidos.windowProducto("Alta de item punteo");
	windowProducto.id_fabrica = parametro.id_fabrica;
	
	windowProducto.addListener("aceptado", function(e){
		var tableModel = e.getData();
		var rowData;
		var rowBuscado;
		for (var x = 0; x < tableModel.getRowCount(); x++) {
			rowData = tableModel.getRowData(x);
			if (rowData.cantidad > 0) {
				rowBuscado = tblPedido.buscar("id_producto_item", rowData.id_producto_item, true, 5);
				if (rowBuscado == null) {
					rowData.id_pedido_ext = parametro.id_pedido_ext;
					rowData.ingresar = 0;
					rowData.sumado = rowData.cantidad;
					rowData.restado = 0;
					rowData.total = rowData.cantidad;
					rowData.cantidad = null;
					tableModelPedido.addRowsAsMapArray([rowData], null, true);
					//tableModelPedido.sortByColumn(0, true);
					tblPedido.buscar("id_producto_item", rowData.id_producto_item, true, 5);
				} else {
					if (rowData.cantidad > 0) rowBuscado.sumado = rowBuscado.sumado + rowData.cantidad;
					if (rowData.cantidad < 0) rowBuscado.restado = rowBuscado.restado + rowData.cantidad;
					rowBuscado.total = rowBuscado.total + rowData.cantidad;
					tableModelPedido.setRowsAsMapArray([rowBuscado], tblPedido.getFocusedRow(), true, false);
				}
			}
		}
		tblPedido.focus();
	}, this);
	
	windowProducto.addListener("disappear", function(e){
		tblPedido.focus();
	});
	
	windowProducto.setModal(true);
	application.getRoot().add(windowProducto);

	
	tableModelPedido.setDataAsMapArray(parametro.detalle, true);
	//tableModelPedido.sortByColumn(0, true);
	tblPedido.setFocusedCell(5, 0, true);

	
	},
	members : 
	{

	}
});