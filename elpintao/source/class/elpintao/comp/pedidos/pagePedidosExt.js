qx.Class.define("elpintao.comp.pedidos.pagePedidosExt",
{
	extend : qx.ui.tabview.Page,
	construct : function ()
	{
	this.base(arguments);
	
	this.setLabel('Pedidos a proveedor');
	this.setLayout(new qx.ui.layout.Canvas());
	this.toggleShowCloseButton();
	

	
	this.addListenerOnce("appear", function(e){
		tblPedidoInt.focus();
	});

	
	
	var application = qx.core.Init.getApplication();
	var contexto = this;
	var id_fabrica = "1";
	var internos = [];
	//var rpcInt = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
	var rpcInt = new componente.general.ramon.io.rpc.Rpc("services/", "comp.PedidosExt");
	var abortCallAsyncExt = null;
	var abortCallAsyncInt = null;
	var imageLoadingExt = null;
	var imageLoadingInt = null;
	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	var functionActualizarPedidosExt = this.functionActualizarPedidosExt = function(id_pedido_ext){
		tblPedidoExt.resetSelection();
		tblPedidoExt.setFocusedCell();
		
		tblDetalleExt.setFocusedCell();
		tblDetalleRec.setFocusedCell();
		
		tableModelPedidoExt.setDataAsMapArray([], true);
		tableModelDetalleExt.setDataAsMapArray([], true);
		tableModelDetalleRec.setDataAsMapArray([], true);
		functionCalcularTotales(tableModelDetalleExt, tableModelTotalesExt);
		
		var aux = slbEstado.getModelSelection().getItem(0);
		var p = {};
		p.recibido = (aux == "") ? null : aux;
		p.desde = dtfDesde.getValue();
		p.hasta = dtfHasta.getValue();
		p.id_fabrica = slbFabrica.getModelSelection().getItem(0);
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.PedidosExt");
		rpc.setTimeout(1000 * 60 * 2);
		rpc.callAsync(function(resultado, error, id){
			//alert(qx.lang.Json.stringify(resultado, null, 2));
			
			tableModelPedidoExt.setDataAsMapArray(resultado, true);
			
			if (id_pedido_ext != null) tblPedidoExt.buscar("id_pedido_ext", id_pedido_ext);
			
			tblPedidoExt.focus();
		}, "leer_externos", p);
	};
	
	
	var functionActualizarPedidosInt = qx.lang.Function.bind(function(){
		if (imageLoadingInt == null) {
			var bounds = this.getBounds();
			imageLoadingInt = new qx.ui.basic.Image("elpintao/loading66.gif");
			imageLoadingInt.setBackgroundColor("#FFFFFF");
			imageLoadingInt.setDecorator("main");
			this.add(imageLoadingInt, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
		}
		
		tblPedidoInt.resetSelection();
		tblPedidoInt.setFocusedCell();
		tableModelDetalleStock.setDataAsMapArray([]);
		
		var p = {};
		p.id_fabrica = id_fabrica;
		p.fecha = txtFecha.getValue();
		
		if (p.fecha != null) {
		
			rpcInt.setTimeout(1000 * 60 * 2);
			
			if (abortCallAsyncInt != null) rpcInt.abort(abortCallAsyncInt);
			
			abortCallAsyncInt = rpcInt.callAsync(function(resultado, error, id){
				if (error == null) {
					
					//alert(qx.lang.Json.stringify(resultado, null, 2));
					
					internos = resultado;
					tableModelPedidoInt.setDataAsMapArray(internos, true);
					functionCalcularTotales(tableModelPedidoInt, tableModelTotalesInt);
					
					imageLoadingInt.destroy();
					imageLoadingInt = null;
				} else {
					//alert(qx.lang.Json.stringify(error, null, 2));
				}
				
				abortCallAsyncInt = null;
			}, "leer_internos", p);
		}
	}, this);
	
	
	var functionCalcularTotales = function(tableModelD, tableModelT) {
		var rowDataAsMapDetalle, rowDataDetalle;
		var rowDataAsMapTotales, rowDataTotales;
		var bandera;
		
		tableModelT.setDataAsMapArray([{descrip: "Costo", total: 0}, {descrip: "P.lis.+IVA", total: 0}], true);
		
		for (var i = 0; i < tableModelD.getRowCount(); i++) {
			rowDataAsMapDetalle = tableModelD.getRowDataAsMap(i);
			rowDataDetalle = tableModelD.getRowData(i);
			
			if (rowDataAsMapDetalle.cantidad > 0) {
				rowDataAsMapTotales = tableModelT.getRowDataAsMap(0);
				
				tableModelT.setValueById("total", 0, rowDataAsMapTotales.total + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.costo));
				rowDataAsMapTotales = tableModelT.getRowDataAsMap(1);
				tableModelT.setValueById("total", 1, rowDataAsMapTotales.total + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.plmasiva));
				bandera = true;
				for (var x = 2; x < tableModelT.getRowCount(); x++) {
					rowDataAsMapTotales = tableModelT.getRowDataAsMap(x);
					rowDataTotales = tableModelT.getRowData(x);
					if (rowDataDetalle.id_unidad == rowDataTotales.id_unidad) {
						tableModelT.setValueById("total", x, tableModelT.getValueById("total", x) + (rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad));
						bandera = false;
						break;
					}
				}
				if (bandera) {
					tableModelT.addRowsAsMapArray([{id_unidad: rowDataDetalle.id_unidad, descrip: rowDataAsMapDetalle.unidad, total: rowDataAsMapDetalle.cantidad * rowDataAsMapDetalle.capacidad}], null, true);
				}
			}
		}
	}
	
	
	var stack1 = new qx.ui.container.Stack();
	var composite1 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	var composite2 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	composite2.addListenerOnce("appear", function(e){
		/*
		var children = slbFabrica.getChildren();
		for (var x in children) {
			if (children[x].getModel().get("id_fabrica")=="1") {
				slbFabrica.setSelection([children[x]]);
				break;
			}
		}
		*/
	});
	stack1.add(composite1);
	stack1.add(composite2);
	
	var stack2 = new qx.ui.container.Stack();
	var composite3 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	var composite4 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
	//stack2.add(composite3);
	//stack2.add(composite4);
	
	composite1.add(composite3, {left:0 , top: "33.33%", right: 0, bottom: "33.33%"});
	composite1.add(composite4, {left:0 , top: "66.66%", right: 0, bottom: 0});


	
	
	//Menu de contexto
	
/*
	var commandNuevoDetalle = new qx.ui.command.Command("Insert");
	commandNuevoDetalle.addListener("execute", function(){
		windowProducto.id_fabrica = slbFabrica.getModelSelection().getItem(0).get("id_fabrica");
		windowProducto.center();
		windowProducto.open();
	});
*/	
	var commandEditar = new qx.ui.command.Command("F2");
	commandEditar.setEnabled(false);
	commandEditar.addListener("execute", function(e) {
		tblPedidoInt.setFocusedCell(9, tblPedidoInt.getFocusedRow(), true);
		tblPedidoInt.startEditing();
	});
	
	var menutblPedidoInt = new componente.general.ramon.ui.menu.Menu();
	//var btnNuevoDetalle = new qx.ui.menu.Button("Agregar item...", null, commandNuevoDetalle);
	var btnEditar = new qx.ui.menu.Button("Editar", null, commandEditar);
	var btnGenerarPedExt = new qx.ui.menu.Button("Generar pedido a proveedor...");
	btnGenerarPedExt.setEnabled(false);
	btnGenerarPedExt.addListener("execute", function(e){
		var win = new elpintao.comp.pedidos.windowPedExt("Generar pedido a proveedor - " + lstFabrica.getSelection()[0].getLabel());
		win.addListener("aceptado", function(e){
			var data = e.getData();
			
			var p = {};
			p.model = data;
			p.fecha = txtFecha.getValue();
			p.id_fabrica = id_fabrica;
			p.detalle = tableModelPedidoInt.getDataAsMapArray();
			
			//alert(qx.lang.Json.stringify(p, null, 2));
	
			//var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.PedidosExt");
			try {
				var resultado = rpc.callSync("alta_pedido_ext", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			txtFiltrar.setValue("");
			tgbPedidos.setValue(false);

			functionActualizarPedidosInt();
			functionActualizarPedidosExt(resultado);
			
			rb1.execute();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});

	//menutblPedidoInt.add(btnNuevoDetalle);
	menutblPedidoInt.add(btnEditar);
	menutblPedidoInt.addSeparator();
	menutblPedidoInt.add(btnGenerarPedExt);
	menutblPedidoInt.memorizar();
	
	
	
		
	
	//Tabla

	var tableModelPedidoInt = new qx.ui.table.model.Simple();
	tableModelPedidoInt.setColumns(["Fábrica", "Producto", "Color", "Capacidad", "U", "Pedid.suc.", "Stock", "St.suc.", "Venta suc.", "Cantidad"], ["fabrica", "producto", "color", "capacidad", "unidad", "acumulado", "stock", "stock_suc", "vendido", "cantidad"]);
	//tableModelPedido.setColumns(["Fecha", "Fábrica"], ["fecha", "id_fabrica"]);
	//tableModelPedido.setEditable(true);
	tableModelPedidoInt.setColumnEditable(9, true);
	tableModelPedidoInt.addListener("dataChanged", function(e){
		var rowCount = tableModelPedidoInt.getRowCount();
		
		tblPedidoInt.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
	});

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblPedidoInt = new componente.general.ramon.ui.table.Table(tableModelPedidoInt, custom);
	//tblPedidoInt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblPedidoInt.setShowCellFocusIndicator(true);
	tblPedidoInt.toggleColumnVisibilityButtonVisible();
	//tblPedidoInt.toggleStatusBarVisible();
	tblPedidoInt.edicion="desplazamiento_vertical";
	
	
	var tableColumnModelPedidoInt = tblPedidoInt.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	
		var resizeBehavior = tableColumnModelPedidoInt.getBehavior();
		resizeBehavior.set(0, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"30%", minWidth:100});
		resizeBehavior.set(2, {width:"18%", minWidth:100});
		resizeBehavior.set(3, {width:"6%", minWidth:100});
		resizeBehavior.set(4, {width:"2.5%", minWidth:100});
		resizeBehavior.set(5, {width:"6%", minWidth:100});

		
	var celleditorNumber = new qx.ui.table.celleditor.TextField();
	celleditorNumber.setValidationFunction(function(newValue, oldValue){
		newValue = newValue.trim();
		if (newValue=="") return oldValue;
		else if (isNaN(newValue)) return oldValue; else if (parseFloat(newValue) < 0) return oldValue; else return newValue;
	});
	tableColumnModelPedidoInt.setCellEditorFactory(9, celleditorNumber);
	
	
	tblPedidoInt.setContextMenu(menutblPedidoInt);

	var selectionModelPedidoInt = tblPedidoInt.getSelectionModel();
	selectionModelPedidoInt.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelPedidoInt.addListener("changeSelection", function(e){
		//commandEditar.setEnabled(! selectionModelPedidoInt.isSelectionEmpty() && ! tgbPedidos.getValue());
		if (selectionModelPedidoInt.isSelectionEmpty()) {
			commandEditar.setEnabled(false);
		} else {
			commandEditar.setEnabled(true && ! tgbPedidos.getValue());
			var rowData = tableModelPedidoInt.getRowData(tblPedidoInt.getFocusedRow());
			tableModelDetallePedInt.setDataAsMapArray(rowData.detallePedInt);
			tableModelDetalleStock.setDataAsMapArray(rowData.detalleStock);
			tableModelDetallePedExt.setDataAsMapArray(rowData.detallePedExt);
		}
		menutblPedidoInt.memorizar([commandEditar]);
	});
	
	tblPedidoInt.addListener("cellDbltap", function(e) {
		commandEditar.fireDataEvent("execute");
	});
	
	tblPedidoInt.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value != data.oldValue) {
			var rowData = tableModelPedidoInt.getRowData(data.row);
			rowData.cantidad = data.value;
			functionCalcularTotales(tableModelPedidoInt, tableModelTotalesInt);
		}
	});

	composite2.add(tblPedidoInt, {left:0 , top: 31, right: 0, bottom: "30.5%"});
	//composite1.add(new qx.ui.basic.Label("Pedidos:"), {left:0 , top: 0});
	
	

	composite2.add(new qx.ui.basic.Label("Fábrica: "), {left: 270 , top: 7});
	

	var cboFabrica = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.PedidosExt", "autocompletarFabrica", null, 3);
	cboFabrica.setWidth(170);
	composite2.add(cboFabrica, {left: 320 , top: 3});
	
	var lstFabrica = cboFabrica.getChildControl("list");
	lstFabrica.addListener("changeSelection", function(e){
		tblPedidoInt.setFocusedCell();
		
		internos = [];
		tableModelPedidoInt.setDataAsMapArray(internos, true);
		
		txtFiltrar.setValue("");
	});
	
	
	
	
	
	
	/*
	var slbFabrica = this.slbFabrica = new componente.general.ramon.ui.selectbox.SelectBox();
	slbFabrica.setWidth(170);
	var controllerFabrica = new qx.data.controller.List(null, slbFabrica, "descrip");
	application.objFabrica.store.bind("model", controllerFabrica, "model");
	composite2.add(slbFabrica, {left: 370 , top: 3});
	slbFabrica.addListener("changeSelection", function(e){
		id_fabrica = slbFabrica.getModelSelection().getItem(0).get("id_fabrica");
		if (id_fabrica=="1") {
			tblPedidoInt.setFocusedCell();
			internos = [];
			tableModelPedidoInt.setDataAsMapArray(internos, true);
		} else {
			functionActualizar();
		}
		txtFiltrar.setValue("");
		//chkPedidos.setValue(false);
	});
	*/
	
	
	composite2.add(new qx.ui.basic.Label("Fecha pedido:"), {left: 510, top: 7});
	
	var txtFecha = new qx.ui.form.DateField();
	txtFecha.setValue(new Date);
	txtFecha.addListener("changeValue", function(e){
		tblPedidoInt.setFocusedCell();
		
		internos = [];
		tableModelPedidoInt.setDataAsMapArray(internos, true);
		
		txtFiltrar.setValue("");
	});
	composite2.add(txtFecha, {left: 590, top: 3});
	
	
	var btnAplicarFiltro = new qx.ui.form.Button("Aplicar filtro");
	btnAplicarFiltro.addListener("execute", function(e){
		id_fabrica = lstFabrica.getModelSelection().getItem(0);
		
		if (id_fabrica=="1" || txtFecha.getValue() == null) {
			tblPedidoInt.setFocusedCell();
			internos = [];
			tableModelPedidoInt.setDataAsMapArray(internos, true);
		} else {
			functionActualizarPedidosInt();
		}
		
		txtFiltrar.setValue("");
	});
	composite2.add(btnAplicarFiltro, {left: 730, top: 3});
	
	
	
	composite2.add(new qx.ui.basic.Label("Buscar: "), {left: 900 , top: 7});
	var txtFiltrar = new qx.ui.form.TextField("");
	txtFiltrar.setLiveUpdate(true);
	txtFiltrar.setWidth(120);
	txtFiltrar.addListener("changeValue", function(e){
		var bandera;
		var split;
		
		tblPedidoInt.setFocusedCell();
		var filtrar = txtFiltrar.getValue().trim().toLowerCase();
		if (filtrar=="") {
			tableModelPedidoInt.setDataAsMapArray(internos, true);
		} else {
			split = filtrar.split(" ");
			tableModelPedidoInt.setDataAsMapArray([], true);
			for (var x = 0; x < internos.length; x++) {
				bandera = true;
				for (var y = 0; y < split.length; y++) {
					if (split[y]!="") {
						if (internos[x].busqueda.toLowerCase().indexOf(split[y]) == -1) {
							bandera = false;
							break;
						}
					}
				}
				if (bandera) tableModelPedidoInt.addRowsAsMapArray([internos[x]], null, true);
			}
			if (tableModelPedidoInt.getRowCount() > 0) tblPedidoInt.setFocusedCell(9, 0, true);
		}
	});
	composite2.add(txtFiltrar, {left: 940 , top: 3});
	
	
	

	
	
	

	var tgbPedidos = new qx.ui.form.ToggleButton("Ver editados");
	tgbPedidos.addListener("changeValue", function(e){
		tblPedidoInt.setFocusedCell();
		if (e.getData()) {
			tableModelPedidoInt.setColumnEditable(9, false);
	
			cboFabrica.setEnabled(false);
			txtFiltrar.setEnabled(false);
			txtFecha.setEnabled(false);
			btnAplicarFiltro.setEnabled(false);
			
			tableModelPedidoInt.setDataAsMapArray([], true);
			for (var x = 0; x < internos.length; x++) {
				if (internos[x].cantidad > 0) tableModelPedidoInt.addRowsAsMapArray([internos[x]], null, true);
			}
			btnGenerarPedExt.setEnabled(tableModelPedidoInt.getRowCount() > 0);
		} else {
			tableModelPedidoInt.setColumnEditable(9, true);
			
			cboFabrica.setEnabled(true);
			txtFiltrar.setEnabled(true);
			txtFecha.setEnabled(true);
			btnAplicarFiltro.setEnabled(true);
			btnGenerarPedExt.setEnabled(false);
			txtFiltrar.fireDataEvent("changeValue");
		}
		menutblPedidoInt.memorizar([btnGenerarPedExt]);
		if (tableModelPedidoInt.getRowCount() > 0) tblPedidoInt.setFocusedCell(9, 0, true);
	});
	composite2.add(tgbPedidos, {right: 0 , top: 3});
	
	var chkPedidos = new qx.ui.form.CheckBox("Ver pedidos");
	//composite2.add(chkPedidos, {right: 0 , top: 7});
	
	
	var windowProducto = new elpintao.comp.pedidos.windowProducto("Agregar items");
	windowProducto.setModal(true);
	windowProducto.addListener("aceptado", function(e){
		var tableModel = e.getData();
		var rowData;
		var rowBuscado;
		for (var x = 0; x < tableModel.getRowCount(); x++) {
			rowData = tableModel.getRowData(x);
			if (rowData.cantidad > 0) {
				rowBuscado = tblPedidoInt.buscar("id_producto_item", rowData.id_producto_item, true, 9);
				if (rowBuscado == null) {
					rowData.detalle = [];
					tableModelPedidoInt.addRowsAsMapArray([rowData], null, true);
					tblPedidoInt.buscar("id_producto_item", rowData.id_producto_item, true, 9);
				} else {
					rowBuscado.cantidad = rowBuscado.cantidad + rowData.cantidad;
					tableModelPedidoInt.setRowsAsMapArray([rowBuscado], tblPedidoInt.getFocusedRow(), true, false);
				}
				functionCalcularTotales(tableModelPedidoInt, tableModelTotalesInt);
				btnGenerarPedExt.setEnabled(tableModelTotalesInt.getRowCount() > 2);
				menutblPedidoInt.memorizar([btnGenerarPedExt]);
			}
		}
		tblPedidoInt.focus();
	}, this);
	
	windowProducto.addListener("disappear", function(e){
		tblPedidoInt.focus();
	});
	
	application.getRoot().add(windowProducto);
	
	
	
	
	
	
	
	

	
	
	//Tabla

	var tableModelTotalesInt = new qx.ui.table.model.Simple();
	tableModelTotalesInt.setColumns(["", "Total"], ["descrip", "total"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblTotalesInt = new componente.general.ramon.ui.table.Table(tableModelTotalesInt, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblTotalesInt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblTotalesInt.setShowCellFocusIndicator(false);
	tblTotalesInt.toggleColumnVisibilityButtonVisible();
	tblTotalesInt.toggleStatusBarVisible();
	
	var tableColumnModelTotalesInt = tblTotalesInt.getTableColumnModel();
	
	var renderer = new qx.ui.table.cellrenderer.Number();
	renderer.setNumberFormat(numberformatMonto);
	tableColumnModelTotalesInt.setDataCellRenderer(1, renderer);
	
	composite2.add(tblTotalesInt, {left: "85%", top: "70%", right: 0, bottom: 0});
	
	
	//Tabla

	var tableModelDetallePedInt = new qx.ui.table.model.Simple();
	tableModelDetallePedInt.setColumns(["Sucursal", "Cantidad"], ["descrip", "cantidad"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetallePedInt = new componente.general.ramon.ui.table.Table(tableModelDetallePedInt, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblDetallePedInt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblDetallePedInt.setShowCellFocusIndicator(false);
	tblDetallePedInt.toggleColumnVisibilityButtonVisible();
	tblDetallePedInt.toggleStatusBarVisible();
	
	composite2.add(tblDetallePedInt, {left: 0, top: "74%", bottom: 0});
	composite2.add(new qx.ui.basic.Label("Detalle pedidos int."), {left: 0, top: "71%"});
	
	
	//Tabla

	var tableModelDetalleStock = new qx.ui.table.model.Simple();
	tableModelDetalleStock.setColumns(["Sucursal", "Stock"], ["descrip", "stock"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalleStock = new componente.general.ramon.ui.table.Table(tableModelDetalleStock, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblDetalleStock.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblDetalleStock.setShowCellFocusIndicator(false);
	tblDetalleStock.toggleColumnVisibilityButtonVisible();
	tblDetalleStock.toggleStatusBarVisible();
	
	composite2.add(tblDetalleStock, {left: 230, top: "74%", bottom: 0});
	composite2.add(new qx.ui.basic.Label("Detalle stock"), {left: 230, top: "71%"});
	
	
	//Tabla

	var tableModelDetallePedExt = new qx.ui.table.model.Simple();
	tableModelDetallePedExt.setColumns(["Fecha", "Cantidad"], ["fecha", "cantidad"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetallePedExt = new componente.general.ramon.ui.table.Table(tableModelDetallePedExt, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblDetallePedExt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblDetallePedExt.setShowCellFocusIndicator(false);
	tblDetallePedExt.toggleColumnVisibilityButtonVisible();
	tblDetallePedExt.toggleStatusBarVisible();
	
	var tableColumnModelDetallePedExt = tblDetallePedExt.getTableColumnModel();
	
	var celleditorDate1 = new qx.ui.table.cellrenderer.Date();
	celleditorDate1.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd"));
	tableColumnModelDetallePedExt.setDataCellRenderer(0, celleditorDate1);
	
	composite2.add(tblDetallePedExt, {left: 470, top: "74%", bottom: 0});
	composite2.add(new qx.ui.basic.Label("Detalle pedidos ext."), {left: 470, top: "71%"});
	

	functionCalcularTotales(tableModelPedidoInt, tableModelTotalesInt);
	
	
	
		var toolbar1 = new qx.ui.toolbar.ToolBar();
		var rb1 = new qx.ui.toolbar.RadioButton(" Pedidos generados ");
		var rb2 = new qx.ui.toolbar.RadioButton(" Pedir a proveedor ");
		rb1.addListener("execute", function(){stack1.setSelection([composite1]);});
		rb2.addListener("execute", function(){stack1.setSelection([composite2]);});
		toolbar1.add(rb1);
		toolbar1.add(rb2);
		var radioGroup1 = new qx.ui.form.RadioGroup(rb1, rb2);
		this.add(stack1, {left: 0, top: 0, right: 0, bottom: 0});
		this.add(toolbar1, {left: 0, top: 0});
		
		



		
		
	var layout = new qx.ui.layout.Grid(6, 6);
    for (var i = 0; i < 15; i++) {
    	layout.setColumnAlign(i, "left", "middle");
    }
    layout.setRowHeight(0, 24);
		
	var composite = new qx.ui.container.Composite(layout);
	
	composite.add(new qx.ui.basic.Label("Estado:"), {row: 0, column: 0});
	
	var slbEstado = this.slbEstado = new qx.ui.form.SelectBox();
	slbEstado.setWidth(90);
	slbEstado.add(new qx.ui.form.ListItem("Pendiente", null, "0"));
	slbEstado.add(new qx.ui.form.ListItem("Recibido", null, "1"));

	composite.add(slbEstado, {row: 0, column: 1});
	
	var aux = new Date;
	var dtfDesde = this.dtfDesde = new qx.ui.form.DateField();
	dtfDesde.setWidth(90);
	var dtfHasta = this.dtfHasta = new qx.ui.form.DateField();
	dtfHasta.setWidth(90);
	dtfHasta.setValue(aux);
	aux.setMonth(aux.getMonth() - 1);
	dtfDesde.setValue(aux);
	
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
	
	

	
	var rpc = new qx.io.remote.Rpc("services/", "comp.Reparacion");
	try {
		var resultado = rpc.callSync("autocompletarFabrica", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	var slbFabrica = this.slbFabrica = new qx.ui.form.SelectBox();
	slbFabrica.setWidth(200);
	
	slbFabrica.add(new qx.ui.form.ListItem("-", null, "0"));
	for (var x in resultado) {
		slbFabrica.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	
	composite.add(new qx.ui.basic.Label("Fábrica:"), {row: 0, column: 11});
	composite.add(slbFabrica, {row: 0, column: 12});
	
	composite1.add(composite, {left: 270, top: 0});
	
		
	
	var btnFiltrar = new qx.ui.form.Button("Aplicar filtro");
	btnFiltrar.addListener("execute", function(e){
		functionActualizarPedidosExt();
	});
	
	composite.add(btnFiltrar, {row: 0, column: 18});
		
		
		
		
		
		
		
	var menutblPedidoExt = new componente.general.ramon.ui.menu.Menu();
	
	var btnRecibirPedExt = new qx.ui.menu.Button("Recibir pedido a proveedor...");
	btnRecibirPedExt.setEnabled(false);
	btnRecibirPedExt.addListener("execute", function(e) {
		var rowData = tableModelPedidoExt.getRowData(tblPedidoExt.getFocusedRow());
		if (! rowData.recibido) {
			var dateFormat = new qx.util.format.DateFormat("yyyy-MM-dd");
			
			var p = {};
			p.id_pedido_ext = rowData.id_pedido_ext;
			p.id_fabrica = rowData.id_fabrica;
			p.fabrica_descrip = rowData.fabrica;
			p.label = "Pedido a proveedor: " + dateFormat.format(rowData.fecha) + " - " + rowData.fabrica;
			p.detalle = tableModelDetalleExt.getDataAsMapArray();
			application.functionPuntearPedidoExt(p);
		}
	});
	
	var btnImprimir = new qx.ui.menu.Button("Imprimir");
	btnImprimir.setEnabled(false);
	btnImprimir.addListener("execute", function(e) {
		var rowData = tableModelPedidoExt.getRowData(tblPedidoExt.getFocusedRow());
		window.open("services/class/comp/Impresion.php?rutina=imprimir_pedext&id_pedido_ext=" + rowData.id_pedido_ext);
	});
	
	var btnGenerarPedido = new qx.ui.menu.Button("Pedido de productos faltantes...");
	btnGenerarPedido.setEnabled(false);
	btnGenerarPedido.addListener("execute", function(e) {
		tblPedidoExt.blur();
		
		(new dialog.Confirm({
	        "message"   : "Desea generar pedido automático de productos faltantes?",
	        "callback"  : function(e){
							if (e) {
								tblPedidoExt.blur();
								
								var rowData = tableModelPedidoExt.getRowData(tblPedidoExt.getFocusedRow());
								
								var p = {};
								p.id_pedido_ext = rowData.id_pedido_ext;
								p.pedido_ext_detalle = [];
								
								var pedido_ext_detalle = tableModelDetalleExt.getDataAsMapArray();
								for (var x in pedido_ext_detalle) {
									if (pedido_ext_detalle[x].diferencia > 0) p.pedido_ext_detalle.push(pedido_ext_detalle[x]);
								}
								
								var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
								rpc.addListener("completed", function(e){
									var data = e.getData();
									
									functionActualizarPedidosExt(data.result);
								});
					
								rpc.callAsyncListeners(true, "generar_pedido_faltante", p);
							} else {
								tblPedidoExt.focus();
							}
	        			},
	        "context"   : this,
	        "image"     : "icon/48/status/dialog-warning.png"
		})).show();
	});
	
	menutblPedidoExt.add(btnRecibirPedExt);
	menutblPedidoExt.add(btnImprimir);
	menutblPedidoExt.addSeparator();
	menutblPedidoExt.add(btnGenerarPedido);
	
	menutblPedidoExt.memorizar();
		
		

	//Tabla

	var tableModelPedidoExt = new qx.ui.table.model.Simple();
	tableModelPedidoExt.setColumns(["Fecha", "Fábrica", "Teléfono", "E-mail", "Transporte", "Domic.entrega", "Recibido", "Nro.remito", "Ped.faltante"], ["fecha", "fabrica", "telefono", "email", "transporte", "domicilio", "fecha_recibido", "nro_remito", "faltante"]);
	tableModelPedidoExt.setColumnSortable(0, false);
	tableModelPedidoExt.setColumnSortable(1, false);
	tableModelPedidoExt.setColumnSortable(2, false);
	tableModelPedidoExt.setColumnSortable(3, false);
	tableModelPedidoExt.setColumnSortable(4, false);
	tableModelPedidoExt.setColumnSortable(5, false);
	tableModelPedidoExt.setColumnSortable(6, false);
	tableModelPedidoExt.setColumnSortable(7, false);
	tableModelPedidoExt.setColumnSortable(8, false);
	//tableModelPedido.setColumns(["Fecha", "Fábrica"], ["fecha", "id_fabrica"]);
	//tableModelPedido.setEditable(true);
	tableModelPedidoExt.addListener("dataChanged", function(e){
		var rowCount = tableModelPedidoExt.getRowCount();
		
		tblPedidoExt.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
	});
	

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblPedidoExt = new componente.general.ramon.ui.table.Table(tableModelPedidoExt, custom);
	//tblPedidoExt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblPedidoExt.setShowCellFocusIndicator(false);
	tblPedidoExt.toggleColumnVisibilityButtonVisible();
	//tblPedidoExt.toggleStatusBarVisible();
	tblPedidoExt.setContextMenu(menutblPedidoExt);
	
	
	var tableColumnModelPedidoExt = tblPedidoExt.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	
	/*
	var resizeBehavior = tableColumnModelPedidoExt.getBehavior();
	resizeBehavior.set(0, {width:"10%", minWidth:100});
	resizeBehavior.set(1, {width:"10%", minWidth:100});
	resizeBehavior.set(2, {width:"10%", minWidth:100});
	resizeBehavior.set(3, {width:"10%", minWidth:100});
	resizeBehavior.set(4, {width:"10%", minWidth:100});
	resizeBehavior.set(5, {width:"10%", minWidth:100});
	resizeBehavior.set(6, {width:"10%", minWidth:100});
	resizeBehavior.set(7, {width:"10%", minWidth:100});
	resizeBehavior.set(8, {width:"10%", minWidth:100});
	*/
	
	
	var celleditorDate1 = new qx.ui.table.cellrenderer.Date();
	celleditorDate1.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd"));
	tableColumnModelPedidoExt.setDataCellRenderer(0, celleditorDate1);
	
	var celleditorDate2 = new qx.ui.table.cellrenderer.Date();
	celleditorDate2.setDateFormat(new qx.util.format.DateFormat("yyyy-MM-dd HH:mm:ss"));
	tableColumnModelPedidoExt.setDataCellRenderer(6, celleditorDate2);
	

	var selectionModelPedidoExt = tblPedidoExt.getSelectionModel();
	selectionModelPedidoExt.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelPedidoExt.addListener("changeSelection", qx.lang.Function.bind(function(e){
		if (selectionModelPedidoExt.isSelectionEmpty()) {
			btnRecibirPedExt.setEnabled(false);
			btnImprimir.setEnabled(false);
		} else {
			tblDetalleExt.setFocusedCell();
			tblTotalesExt.setFocusedCell();
			tblDetalleRec.setFocusedCell();
			tableModelDetalleExt.setDataAsMapArray([], true);
			tableModelDetalleRec.setDataAsMapArray([], true);
			tableModelTotalesExt.setDataAsMapArray([], true);
			
			var rowData = tableModelPedidoExt.getRowData(tblPedidoExt.getFocusedRow());
			
			if (imageLoadingExt == null) {
				var bounds = this.getBounds();
				imageLoadingExt = new qx.ui.basic.Image("elpintao/loading66.gif");
				imageLoadingExt.setBackgroundColor("#FFFFFF");
				imageLoadingExt.setDecorator("main");
				this.add(imageLoadingExt, {left: parseInt(bounds.width / 2 - 33), top: parseInt(bounds.height / 2 - 33)});
			}

			btnImprimir.setEnabled(true);
			btnRecibirPedExt.setEnabled(! rowData.recibido);
			btnGenerarPedido.setEnabled(false);
			
			var p = {};
			p.id_pedido_ext = rowData.id_pedido_ext;
			
			var rpc = new qx.io.remote.Rpc("services/", "comp.PedidosExt");
			rpc.setTimeout(1000 * 60 * 2);
			
			if (abortCallAsyncExt != null) rpc.abort(abortCallAsyncExt);

			abortCallAsyncExt = rpc.callAsync(function(resultado, error, id){
				if (error == null) {
					
					if (rowData.recibido && rowData.id_pedido_ext_faltante == null) {
						var bandera = false;
						for (var x in resultado.detalle) {
							if (resultado.detalle[x].diferencia > 0) {
								bandera = true;
								break;
							}
						}
						btnGenerarPedido.setEnabled(bandera);
					}
					
					tableModelDetalleExt.setDataAsMapArray(resultado.detalle, true);
					tableModelDetalleRec.setDataAsMapArray(resultado.recibidos, true);
					functionCalcularTotales(tableModelDetalleExt, tableModelTotalesExt);
					
					imageLoadingExt.destroy();
					imageLoadingExt = null;
				} else {
					//alert(qx.lang.Json.stringify(error, null, 2));
				}
				
				abortCallAsyncExt = null;
			}, "leer_externos_detalle", p);
		}
		menutblPedidoExt.memorizar([btnRecibirPedExt, btnImprimir, btnGenerarPedido]);
	}, this));

	composite1.add(tblPedidoExt, {left:0, top: 31, right: "15.5%", bottom: "66.66%"});
	
	
	//Tabla
	
	var tableModelDetalleExt = new qx.ui.table.model.Simple();
	tableModelDetalleExt.setColumns(["Producto", "Color", "Capacidad", "U", "P.lis.", "P.lis.+IVA", "Cantidad", "estado_condicion"], ["producto", "color", "capacidad", "unidad", "precio_lista", "plmasiva", "cantidad", "estado_condicion"]);
	tableModelDetalleExt.setColumnSortable(0, false);
	tableModelDetalleExt.setColumnSortable(1, false);
	tableModelDetalleExt.setColumnSortable(2, false);
	tableModelDetalleExt.setColumnSortable(3, false);
	tableModelDetalleExt.setColumnSortable(4, false);
	tableModelDetalleExt.setColumnSortable(5, false);
	tableModelDetalleExt.setColumnSortable(6, false);
	tableModelDetalleExt.addListener("dataChanged", function(e){
		var rowCount = tableModelDetalleExt.getRowCount();
		
		tblDetalleExt.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
	});
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalleExt = new componente.general.ramon.ui.table.Table(tableModelDetalleExt, custom);
	//tblDetalleExt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblDetalleExt.setShowCellFocusIndicator(false);
	tblDetalleExt.toggleColumnVisibilityButtonVisible();
	//tblDetalleExt.toggleStatusBarVisible();
	
	var tableColumnModelDetalleExt = tblDetalleExt.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	

      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalleExt.getBehavior();
		resizeBehavior.set(0, {width:"47%", minWidth:100});
		resizeBehavior.set(1, {width:"18%", minWidth:100});
		resizeBehavior.set(2, {width:"7%", minWidth:100});
		resizeBehavior.set(3, {width:"3%", minWidth:100});
		resizeBehavior.set(4, {width:"7%", minWidth:100});
		resizeBehavior.set(5, {width:"8%", minWidth:100});
		resizeBehavior.set(6, {width:"10%", minWidth:100});
		
		
	var cellrendererString = new qx.ui.table.cellrenderer.String();
	//cellrendererString.addNumericCondition("==", 1, null, "#FF8000", null, null, "estado_condicion");
	cellrendererString.addNumericCondition("==", 1, null, "#FF0000", null, null, "estado_condicion");
	cellrendererString.addNumericCondition("==", 2, null, "#119900", null, null, "estado_condicion");
	tableColumnModelDetalleExt.setDataCellRenderer(0, cellrendererString);
		
		
		var renderer = new qx.ui.table.cellrenderer.Number();
		renderer.setNumberFormat(numberformatMonto);
		tableColumnModelDetalleExt.setDataCellRenderer(4, renderer);
		tableColumnModelDetalleExt.setDataCellRenderer(5, renderer);

		
	
	var selectionModelDetalleExt = tblDetalleExt.getSelectionModel();
	selectionModelDetalleExt.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelDetalleExt.addListener("changeSelection", function(e){
		if (! selectionModelDetalleExt.isSelectionEmpty()) {
			var rowData = tableModelDetalleExt.getRowData(tblDetalleExt.getFocusedRow());
			
			tblDetalleRec.buscar("id_producto_item", rowData.id_producto_item);
		}
	});
	
	
	composite3.add(tblDetalleExt, {left:0, top: 20, right: "15.5%", bottom: 0});
	
	//this.add(tblPedido, {left:0 , top: 20, right: 0, height: "40%"});
	
	//composite1.add(new qx.ui.basic.Label("Detalle:"), {left: 0, top: "47%"});
	
	
	
	//Tabla

	var tableModelTotalesExt = new qx.ui.table.model.Simple();
	tableModelTotalesExt.setColumns(["", "Total"], ["descrip", "total"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblTotalesExt = new componente.general.ramon.ui.table.Table(tableModelTotalesExt, custom);
	//tblTotales.toggleShowCellFocusIndicator();
	tblTotalesExt.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblTotalesExt.setShowCellFocusIndicator(false);
	tblTotalesExt.toggleColumnVisibilityButtonVisible();
	tblTotalesExt.toggleStatusBarVisible();
	
	var tableColumnModelTotalesExt = tblTotalesExt.getTableColumnModel();
	
	var renderer = new qx.ui.table.cellrenderer.Number();
	renderer.setNumberFormat(numberformatMonto);
	tableColumnModelTotalesExt.setDataCellRenderer(1, renderer);
	
	composite3.add(tblTotalesExt, {left: "85%", top: 20, right: 0, bottom: 0});
	
	composite3.add(new qx.ui.basic.Label("Detalle pedido"), {left:0, top: 3});
	
	
	

	
	
	
		var toolbar2 = new qx.ui.toolbar.ToolBar();
		var rb3 = new qx.ui.toolbar.RadioButton(" Detalle pedido ");
		var rb4 = new qx.ui.toolbar.RadioButton(" Detalle recibido ");
		rb3.addListener("execute", function(){stack2.setSelection([composite3]);});
		rb4.addListener("execute", function(){stack2.setSelection([composite4]);});
		toolbar2.add(rb3);
		toolbar2.add(rb4);
		var radioGroup2 = new qx.ui.form.RadioGroup(rb3, rb4);
		//composite1.add(toolbar2, {left: 0, top: "48%"});
		//composite1.add(stack2, {left: 0, top: "52%", right: 0, bottom: 0});
	
	
	
	

	var tableModelDetalleRec = new qx.ui.table.model.Simple();
	tableModelDetalleRec.setColumns(["Producto", "Color", "Capacidad", "U", "Sumado", "Restado", "Cantidad", "estado_condicion"], ["producto", "color", "capacidad", "unidad", "sumado", "restado", "cantidad", "estado_condicion"]);
	tableModelDetalleRec.setColumnSortable(0, false);
	tableModelDetalleRec.setColumnSortable(1, false);
	tableModelDetalleRec.setColumnSortable(2, false);
	tableModelDetalleRec.setColumnSortable(3, false);
	tableModelDetalleRec.setColumnSortable(4, false);
	tableModelDetalleRec.addListener("dataChanged", function(e){
		var rowCount = tableModelDetalleRec.getRowCount();
		
		tblDetalleRec.setAdditionalStatusBarText(rowCount + ((rowCount == 1) ? " item" : " items"));
	});
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalleRec = new componente.general.ramon.ui.table.Table(tableModelDetalleRec, custom);
	//tblDetalleRec.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblDetalleRec.setShowCellFocusIndicator(false);
	tblDetalleRec.toggleColumnVisibilityButtonVisible();
	//tblDetalleRec.toggleStatusBarVisible();
	
	var tableColumnModelDetalleRec = tblDetalleRec.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	
      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalleRec.getBehavior();
		resizeBehavior.set(0, {width:"47%", minWidth:100});
		resizeBehavior.set(1, {width:"18%", minWidth:100});
		resizeBehavior.set(2, {width:"7%", minWidth:100});
		resizeBehavior.set(3, {width:"3%", minWidth:100});
		resizeBehavior.set(4, {width:"7%", minWidth:100});
		resizeBehavior.set(5, {width:"8%", minWidth:100});
		resizeBehavior.set(6, {width:"10%", minWidth:100});
		
		
	var cellrendererString = new qx.ui.table.cellrenderer.String();
	//cellrendererString.addNumericCondition("==", 1, null, "#FF8000", null, null, "estado_condicion");
	cellrendererString.addNumericCondition("==", 1, null, "#FF0000", null, null, "estado_condicion");
	cellrendererString.addNumericCondition("==", 2, null, "#119900", null, null, "estado_condicion");
	
	tableColumnModelDetalleRec.setDataCellRenderer(0, cellrendererString);
	
	
		
	var selectionModelDetalleRec = tblDetalleRec.getSelectionModel();
	selectionModelDetalleRec.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelDetalleRec.addListener("changeSelection", function(e){
		if (! selectionModelDetalleRec.isSelectionEmpty()) {
			var rowData = tableModelDetalleRec.getRowData(tblDetalleRec.getFocusedRow());
			
			tblDetalleExt.buscar("id_producto_item", rowData.id_producto_item);
		}
	});

		
	composite4.add(tblDetalleRec, {left:0, top: 20, right: "15.5%", bottom: 0});
	
	composite4.add(new qx.ui.basic.Label("Detalle recibido"), {left:0, top: 3});
		
		
		

	
	
	
	functionCalcularTotales(tableModelDetalleExt, tableModelTotalesExt);

	
	//functionActualizar();
	functionActualizarPedidosExt();
	internos = [];
	tableModelPedidoInt.setDataAsMapArray(internos, true);
	


	
	},
	members : 
	{

	}
});