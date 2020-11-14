qx.Class.define("componente.elpintao.ramon.productos.windowStock",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (id_arbol, id_producto, clasificacion)
	{
		this.base(arguments);
		
		this.set({
			caption: "Edición de Stock sucursales",
			width: 600,
			height: 700,
			showMinimize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		this.addListenerOnce("appear", function(e) {
			var children = slbSucursal.getChildren();
			for (var x in children) {
				if (children[x].getModel() == application.rowParamet.id_sucursal) slbSucursal.setSelection([children[x]]);
			}
			slbSucursal.focus();
		});
		
		

		var application = qx.core.Init.getApplication();
		var model;
		var producto_item = {};
		var arrayColor = [];
		
		var numberformatMontoEng = new qx.util.format.NumberFormat("en");
		numberformatMontoEng.setGroupingUsed(false);
		numberformatMontoEng.setMaximumFractionDigits(2);
		numberformatMontoEng.setMinimumFractionDigits(2);
		
		
	var commandEditar = new qx.ui.command.Command("F2");
	commandEditar.setEnabled(false);
	commandEditar.addListener("execute", function(e) {
		tblDatos.setFocusedCell(4, tblDatos.getFocusedRow(), true);
		tblDatos.startEditing();
	}, this);
		

	
	var btnEditar = new qx.ui.menu.Button("Editar", null, commandEditar);
	
	var menu = new componente.general.ramon.ui.menu.Menu();
	menu.add(btnEditar);
	menu.memorizar();
		
	
	

		
		//Tabla Datos

		var tableModelDatos = new qx.ui.table.model.Simple();
		tableModelDatos.setColumns(["Color", "Capac.", "U", "St.sucursales", "Stock", "stsuc_bandera", "stock_bandera"], ["color", "capacidad", "unidad", "stsuc", "stock", "stsuc_bandera", "stock_bandera"]);
		//tableModelDatos.setEditable(true);
		
		tableModelDatos.setSortMethods(1, function(row1, row2) {
			var resultado;
			//if (row1[2].toLowerCase() == row2[2].toLowerCase()) {if (row1[3] == row2[3]) {if (row1[4].toLowerCase() == row2[4].toLowerCase()) {resultado = 0;} else resultado = ((row1[4].toLowerCase() > row2[4].toLowerCase()) ? 1 : -1);} else resultado = ((row1[3] > row2[3]) ? 1 : -1);} else resultado = ((row1[2].toLowerCase() > row2[2].toLowerCase()) ? 1 : -1);
			if (row1[1].toLowerCase() == row2[1].toLowerCase()) {if (row1[3].toLowerCase() == row2[3].toLowerCase()) {if (row1[2] == row2[2]) {resultado = 0;} else resultado = ((row1[2] > row2[2]) ? 1 : -1);} else resultado = ((row1[3].toLowerCase() > row2[3].toLowerCase()) ? 1 : -1);} else resultado = ((row1[1].toLowerCase() > row2[1].toLowerCase()) ? 1 : -1);
			return resultado;
		});


		tableModelDatos.setColumnEditable(4, true);


		tableModelDatos.setColumnSortable(0, false);
		tableModelDatos.setColumnSortable(1, false);
		tableModelDatos.setColumnSortable(2, false);
		tableModelDatos.setColumnSortable(3, false);
		tableModelDatos.setColumnSortable(4, false);
		
		
		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblDatos = this._tblDatos = new componente.general.ramon.ui.table.Table(tableModelDatos, custom);
		tblDatos.edicion = "edicion_vertical";
		tblDatos.setShowCellFocusIndicator(true);
		tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
		tblDatos.toggleColumnVisibilityButtonVisible();
		tblDatos.toggleStatusBarVisible();
		
		tblDatos.addListener("cellDbltap", function(e){
			commandEditar.execute();
		});
		
		
		var tableColumnModelDatos = tblDatos.getTableColumnModel();
		tableColumnModelDatos.setColumnVisible(5, false);
		tableColumnModelDatos.setColumnVisible(6, false);
		
		var resizeBehavior = tableColumnModelDatos.getBehavior();
		resizeBehavior.set(0, {width:"40%", minWidth:100});
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(2, {width:"10%"});
		resizeBehavior.set(3, {width:"20%", minWidth:100});
		resizeBehavior.set(4, {width:"20%", minWidth:100});

		
		
/*		
		resizeBehavior.set(0, {width:"2.5%", minWidth:100});
		resizeBehavior.set(1, {width:"24%", minWidth:100});
		resizeBehavior.set(2, {width:"6%", minWidth:100});
		resizeBehavior.set(3, {width:"3.5%"});
		resizeBehavior.set(4, {width:"7.5%", minWidth:100});
		resizeBehavior.set(5, {width:"8.1%", minWidth:100});
		resizeBehavior.set(6, {width:"8%", minWidth:100});
		resizeBehavior.set(7, {width:"8%", minWidth:100});
		resizeBehavior.set(8, {width:"8.9%", minWidth:100});
		resizeBehavior.set(9, {width:"8%", minWidth:100});
		resizeBehavior.set(10, {width:"8%", minWidth:100});
		resizeBehavior.set(11, {width:"8%", minWidth:100});
*/
		
		
		
		/*
		tableColumnModelDatos.setColumnWidth(0, 20);
		tableColumnModelDatos.setColumnWidth(1, "20%");
		tableColumnModelDatos.setColumnWidth(2, 50);
		tableColumnModelDatos.setColumnWidth(3, 21);
		tableColumnModelDatos.setColumnWidth(4, 75);
		tableColumnModelDatos.setColumnWidth(5, 75);
		tableColumnModelDatos.setColumnWidth(6, 75);
		tableColumnModelDatos.setColumnWidth(7, 75);
		tableColumnModelDatos.setColumnWidth(8, 78);
		tableColumnModelDatos.setColumnWidth(9, 75);
		tableColumnModelDatos.setColumnWidth(10, 75);
		tableColumnModelDatos.setColumnWidth(11, 75);
		*/
		
		

		var cellrendererNumber1 = new qx.ui.table.cellrenderer.Number();
		cellrendererNumber1.addNumericCondition("==", -1, null, "#ff0000", null, null, "stsuc_bandera");
		cellrendererNumber1.addNumericCondition("==", 0, null, "#FFFF00", null, null, "stsuc_bandera");
		cellrendererNumber1.addNumericCondition("==", 1, null, null, null, null, "stsuc_bandera");
		
		var cellrendererNumber2 = new qx.ui.table.cellrenderer.Number();
		cellrendererNumber2.addNumericCondition("==", -1, null, "#ff0000", null, null, "stock_bandera");
		cellrendererNumber2.addNumericCondition("==", 0, null, "#FFFF00", null, null, "stock_bandera");
		cellrendererNumber2.addNumericCondition("==", 1, null, null, null, null, "stock_bandera");
		
		tableColumnModelDatos.setDataCellRenderer(3, cellrendererNumber1);
		tableColumnModelDatos.setDataCellRenderer(4, cellrendererNumber2);
		
		
		var celleditorNumber = new qx.ui.table.celleditor.TextField();
		celleditorNumber.setValidationFunction(function(newValue, oldValue){
			newValue = newValue.trim();
			if (newValue == "") return oldValue;
			//else if (isNaN(newValue)) return oldValue; else return newValue;
			else if (isNaN(newValue)) return oldValue; else if (parseFloat(newValue) < 0) return oldValue; else return newValue;
		});

		tableColumnModelDatos.setCellEditorFactory(4, celleditorNumber);
		
		
		

		
	tblDatos.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value != data.oldValue) {
			var focusedRow = tblDatos.getFocusedRow();
			var rowData = tableModelDatos.getRowData(focusedRow);
			
			var p = {};
			p.id_sucursal = slbSucursal.getModelSelection().getItem(0);
			//p.url = application.arraySucursales[p.id_sucursal].url;
			p.url = "localhost";
			p.username = application.arraySucursales[p.id_sucursal].username;
			p.password = application.arraySucursales[p.id_sucursal].password;
			p.base = application.arraySucursales[p.id_sucursal].base;
			p.id_producto_item = rowData.id_producto_item;
			p.stock = data.value;
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("http://pintao:1qaz2wsx@" + application.arraySucursales[p.id_sucursal].url + "/elpintao/services/", "componente.elpintao.ramon.Stock");
			rpc.setCrossDomain(true);
			rpc.callAsync(function(resultado, error, id) {
				if (error != null) {
					tblDatos.cancelEditing();
					tblDatos.blur();
					rowData.stock = data.oldValue;
					tableModelDatos.setRowsAsMapArray([rowData], focusedRow, true);
					tblDatos.setFocusedCell(4, focusedRow, true);
					dialog.Dialog.warning("No se pudo grabar el stock asignado en la sucursal correspondiente. Intente de nuevo en algún momento.", function(e){
						tblDatos.focus();
					});
				}
			}, "escribir_stock", p);
		}
	});
	
		
		
		var selectionModelDatos = tblDatos.getSelectionModel();
		selectionModelDatos.addListener("changeSelection", function(e){
			commandEditar.setEnabled(! selectionModelDatos.isSelectionEmpty());
			menu.memorizar([commandEditar]);
		});
		
		tblDatos.setContextMenu(menu);
		
	
		this.add(tblDatos, {left: 0, top: 105, right: 0, bottom: 0});
		
		
	this.add(new qx.ui.basic.Label("Sucursal: "), {left: 0, top: 75});
	
	var slbSucursal = new qx.ui.form.SelectBox();

	for (var x in application.arraySucursales) {
		slbSucursal.add(new qx.ui.form.ListItem(application.arraySucursales[x].descrip, null, application.arraySucursales[x].id_sucursal))
	}
	
	slbSucursal.addListener("focus", function(e){
		tblDatos.cancelEditing();
	});
	
	slbSucursal.addListener("changeSelection", function(e){
		var data = e.getData();
		var arraySucursalesLength = Object.keys(application.arraySucursales).length;
		var contador = 0;
		var recibidos = 0;
		
		slbSucursal.setEnabled(false);
		tblDatos.setFocusedCell();
		tblDatos.setEnabled(false);

		for (var z in model.producto_item) {
			model.producto_item[z].stsuc = 0;
			model.producto_item[z].stock = 0;
			model.producto_item[z].stsuc_bandera = -1;
			model.producto_item[z].stock_bandera = -1;
		}
		tableModelDatos.setDataAsMapArray(model.producto_item, true);
		
		for (var x in application.arraySucursales) {
			var p = {};
			p.id_producto = id_producto;
			p.id_sucursal = application.arraySucursales[x].id_sucursal;
			//p.url = application.arraySucursales[x].url;
			p.url = "localhost";
			p.username = application.arraySucursales[x].username;
			p.password = application.arraySucursales[x].password;
			p.base = application.arraySucursales[x].base;
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("http://pintao:1qaz2wsx@" + application.arraySucursales[x].url + "/elpintao/services/", "componente.elpintao.ramon.Stock");
			//var rpc = new componente.general.ramon.io.rpc.Rpc("http://root@" + application.arraySucursales[x].url + "/services/", "componente.elpintao.ramon.Stock");
			rpc.setCrossDomain(true);
			rpc.callAsync(function(resultado, error, id) {
				//alert(qx.lang.Json.stringify(resultado, null, 2));
				//alert(qx.lang.Json.stringify(error, null, 2));
				
				
				contador = contador + 1;
				//alert(contador);
				if (error == null) {
					recibidos = recibidos + 1;
				
					for (var y in resultado.producto_item) {
						if (resultado.id_sucursal == data[0].getModel()) {
							producto_item[resultado.producto_item[y].id_producto_item].stock = resultado.producto_item[y].stock;
							producto_item[resultado.producto_item[y].id_producto_item].stock_bandera = 1;
						} else {
							producto_item[resultado.producto_item[y].id_producto_item].stsuc+= resultado.producto_item[y].stock;
						}
					}
					
					if (arraySucursalesLength == recibidos) {
						for (var y in resultado.producto_item) {
							producto_item[resultado.producto_item[y].id_producto_item].stsuc_bandera = 1;
						}
					}
				} else {
					//alert(qx.lang.Json.stringify(id, null, 2));
					//alert(qx.lang.Json.stringify(error, null, 2));
					//alert("contador: " + contador + ", length: " + arraySucursalesLength);
				}
				
				if (arraySucursalesLength == contador) {
					tblDatos.setEnabled(true);
					slbSucursal.setEnabled(true);
					slbSucursal.focus();
				}
				
				tableModelDatos.setDataAsMapArray(model.producto_item, true);
			}, "leer_stock", p);
		}
	}, this);
	this.add(slbSucursal, {left: 70 , top: 72});
	

		
		
		
		
	
		
		
		var p = {};
		p.id_producto = id_producto;
		p.url = "localhost";
		p.username = application.arraySucursales[application.rowParamet.id_sucursal].username;
		p.password = application.arraySucursales[application.rowParamet.id_sucursal].password;
		p.base = application.arraySucursales[application.rowParamet.id_sucursal].base;
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Stock");
		try {
			var resultado = rpc.callSync("leer_productos", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		

		model = resultado;
		
		for (var x in model.producto_item) {
			producto_item[model.producto_item[x].id_producto_item] = model.producto_item[x];
		}
		
		tableModelDatos.setDataAsMapArray(model.producto_item, true);
		
		//alert(qx.lang.Json.stringify(producto_item, null, 2));
		

	this.add(new qx.ui.basic.Label("Clasificación: "), {left: 0, top: 0});
	this.add(new qx.ui.basic.Label(clasificacion), {left: 70, top: 0});
	
	this.add(new qx.ui.basic.Label("Fábrica: "), {left: 0, top: 20});
	this.add(new qx.ui.basic.Label(model.producto.fabrica), {left: 70, top: 20});
	
	this.add(new qx.ui.basic.Label("Descripción: "), {left: 0, top: 50});
	this.add(new qx.ui.basic.Label(model.producto.descrip), {left: 70, top: 50});
		
		
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});