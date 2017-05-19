qx.Class.define("componente.elpintao.ramon.productos.windowPrecios",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (id_arbol, id_producto, clasificacion)
	{
		this.base(arguments);
		
		this.set({
			caption: "Edicion de Precios",
			width: 1100,
			height: 565,
			showMinimize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		this.addListenerOnce("appear", function(e){
			tblDatos.focus();
		});
		
		
		var application = qx.core.Init.getApplication();

		var contexto = this;
		var model;
		var original;
		var arrayColor = [];
		var numberformatMonto = new qx.util.format.NumberFormat("es");
		numberformatMonto.setGroupingUsed(false);
		numberformatMonto.setMaximumFractionDigits(2);
		numberformatMonto.setMinimumFractionDigits(2);
		
		var numberformatMontoEng = new qx.util.format.NumberFormat("en");
		numberformatMontoEng.setGroupingUsed(false);
		numberformatMontoEng.setMaximumFractionDigits(2);
		numberformatMontoEng.setMinimumFractionDigits(2);
		
		var composite1 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		var composite2 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		var composite3 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		var composite4 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		var composite5 = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
		
		this.add(composite1, {left: 0, top: 65, right: 0, bottom: 44});
		composite1.add(composite2, {left: 0, top: 0, right: 0, height: "50%"});
		composite1.add(composite3, {left: 0, bottom: 0, right: 0, height: "50%"});
		composite3.add(composite4, {left: 0, top: 0, bottom: 0, width: "31.5%"});
		composite3.add(composite5, {right: 0, top: 0, bottom: 0, width: "68.5%"});

	var functionCalcular = function(focusedRow) {
		//var rowDataDatos = tableModelDatos.getRowDataAsMap(focusedRow);
		var rowDataDatos = tableModelDatos.getRowData(focusedRow);
		
		/*
		var plmasiva = rowDataDatos.precio_lista + (rowDataDatos.precio_lista * model.producto.iva / 100);
		var costo = plmasiva - (plmasiva * model.producto.desc_fabrica / 100);
		
		var pcf = costo + (costo * rowDataDatos.remarc_final /100);
		pcf = pcf - ((pcf * rowDataDatos.desc_final) / 100);
		var pcfcd = pcf - ((pcf * rowDataDatos.bonif_final) / 100);
		
		var pmay = costo + (costo * rowDataDatos.remarc_mayorista /100);
		pmay = pmay - ((pmay * rowDataDatos.desc_mayorista) / 100);
		var pmaycd = pmay - ((pmay * rowDataDatos.bonif_mayorista) / 100);
		
		
		var rowDataCalculo = tableModelCalculo.getRowDataAsMap(focusedRow);
		rowDataCalculo.plmasiva = plmasiva;
		rowDataCalculo.costo = costo;
		rowDataCalculo.pcf = pcf;
		rowDataCalculo.pcfcd = pcfcd;
		rowDataCalculo.utilcf = pcfcd - costo;
		rowDataCalculo.pmay = pmay;
		rowDataCalculo.pmaycd = pmaycd;
		rowDataCalculo.utilmay = pmaycd - costo;
		rowDataCalculo.comision = pcfcd * rowDataDatos.comision_vendedor /100;
		
		rowDataCalculo["tooltip1"] = "Precio lista + I.V.A.%" + "<br/>" + numberformatMonto.format(rowDataDatos.precio_lista) + " + " + numberformatMonto.format(model.producto.iva) + "%"
		rowDataCalculo["tooltip2"] = "P.lis.+IVA - Desc.fabrica%" + "<br/>" + numberformatMonto.format(plmasiva) + " - " + numberformatMonto.format(model.producto.desc_fabrica) + "%";
		rowDataCalculo["tooltip3"] = "((Costo + Remarc.CF.%) - Desc.CF.%) - Bonif. CF." + "<br/>(" + numberformatMonto.format(costo) + " + " + numberformatMonto.format(rowDataDatos.remarc_final) + "%) - " + numberformatMonto.format(rowDataDatos.desc_final) + ") - " + numberformatMonto.format(rowDataDatos.bonif_final) + ")";
		rowDataCalculo["tooltip4"] = "Precio CF - Costo" + "<br/>" + numberformatMonto.format(pcf) + " - " + numberformatMonto.format(costo);
		rowDataCalculo["tooltip5"] = "((Costo + Remarc.may.%) - Desc.may.%) - Bonif. may." + "<br/>(" + numberformatMonto.format(costo) + " + " + numberformatMonto.format(rowDataDatos.remarc_mayorista) + "%) - " + numberformatMonto.format(rowDataDatos.desc_mayorista) + ") - " + numberformatMonto.format(rowDataDatos.bonif_mayorista) + ")";
		rowDataCalculo["tooltip6"] = "Precio may. - Costo" + "<br/>" + numberformatMonto.format(pmay) + " - " + numberformatMonto.format(costo);
		rowDataCalculo["tooltip7"] = "Precio CF + Comision / 100" + "<br/>" + numberformatMonto.format(pcfcd) + " + " + rowDataDatos.comision_vendedor + " / 100";
		*/
		
		componente.elpintao.Rutinas.calcularImportes(rowDataDatos);
		
		var rowDataCalculo = tableModelCalculo.getRowDataAsMap(focusedRow);
		rowDataCalculo.plmasiva = rowDataDatos.plmasiva;
		rowDataCalculo.costo = rowDataDatos.costo;
		rowDataCalculo.pcf = rowDataDatos.pcf;
		rowDataCalculo.pcfcd = rowDataDatos.pcfcd;
		rowDataCalculo.utilcf = rowDataDatos.utilcf;
		rowDataCalculo.pmay = rowDataDatos.pmay;
		rowDataCalculo.pmaycd = rowDataDatos.pmaycd;
		rowDataCalculo.utilmay = rowDataDatos.utilmay;
		rowDataCalculo.comision = rowDataDatos.comision;
		
		rowDataCalculo["tooltip1"] = "Precio lista + I.V.A.%" + "<br/>" + numberformatMonto.format(rowDataDatos.precio_lista) + " + " + numberformatMonto.format(rowDataDatos.iva) + "%"
		rowDataCalculo["tooltip2"] = "P.lis.+IVA - Desc.fabrica% - Desc.producto%" + "<br/>" + numberformatMonto.format(rowDataDatos.plmasiva) + " - " + numberformatMonto.format(rowDataDatos.desc_fabrica) + "% - " + numberformatMonto.format(rowDataDatos.desc_producto) + "%";
		rowDataCalculo["tooltip3"] = "((Costo + Remarc.CF.%) - Desc.CF.%) - Bonif. CF.%" + "<br/>(" + numberformatMonto.format(rowDataDatos.costo) + " + " + numberformatMonto.format(rowDataDatos.remarc_final) + "%) - " + numberformatMonto.format(rowDataDatos.desc_final) + "%) - " + numberformatMonto.format(rowDataDatos.bonif_final) + "%)";
		rowDataCalculo["tooltip4"] = "Precio CF - Costo" + "<br/>" + numberformatMonto.format(rowDataDatos.pcf) + " - " + numberformatMonto.format(rowDataDatos.costo);
		rowDataCalculo["tooltip5"] = "((Costo + Remarc.may.%) - Desc.may.%) - Bonif. may.%" + "<br/>(" + numberformatMonto.format(rowDataDatos.costo) + " + " + numberformatMonto.format(rowDataDatos.remarc_mayorista) + "%) - " + numberformatMonto.format(rowDataDatos.desc_mayorista) + "%) - " + numberformatMonto.format(rowDataDatos.bonif_mayorista) + "%)";
		rowDataCalculo["tooltip6"] = "Precio may. - Costo" + "<br/>" + numberformatMonto.format(rowDataDatos.pmay) + " - " + numberformatMonto.format(rowDataDatos.costo);
		rowDataCalculo["tooltip7"] = "Precio CF + Comision / 100" + "<br/>" + numberformatMonto.format(rowDataDatos.pcfcd) + " + " + rowDataDatos.comision_vendedor + " / 100";
		
		tableModelCalculo.setRowsAsMapArray([rowDataCalculo], focusedRow, true);
	}
	

	
	var txtDesc_fabrica = new qx.ui.form.Spinner(-100, 0, 100);
	txtDesc_fabrica.setWidth(50);
	txtDesc_fabrica.setNumberFormat(numberformatMontoEng);
	txtDesc_fabrica.getChildControl("upbutton").setVisibility("excluded");
	txtDesc_fabrica.getChildControl("downbutton").setVisibility("excluded");
	txtDesc_fabrica.setSingleStep(0);
	txtDesc_fabrica.setPageStep(0);
	txtDesc_fabrica.addListener("changeValue", function(e){
		var data = e.getData();
		var rowData;
		for (var x = 0; x < tableModelDatos.getRowCount(); x++) {
			rowData = tableModelDatos.getRowData(x);
			rowData.desc_fabrica = data;
			for (var y in rowData.grupo) {
				rowData.grupo[y].desc_fabrica = data;
			}
			functionCalcular(x);
		}
	});
	this.add(txtDesc_fabrica, {left: 520, top: 15});
	this.add(new qx.ui.basic.Label("Desc.fábrica %: "), {left: 430, top: 20});

	
	
	var txtDesc_producto = new qx.ui.form.Spinner(-100, 0, 100);
	txtDesc_producto.setWidth(50);
	txtDesc_producto.setNumberFormat(numberformatMontoEng);
	txtDesc_producto.getChildControl("upbutton").setVisibility("excluded");
	txtDesc_producto.getChildControl("downbutton").setVisibility("excluded");
	txtDesc_producto.setSingleStep(0);
	txtDesc_producto.setPageStep(0);
	txtDesc_producto.addListener("changeValue", function(e){
		var data = e.getData();
		var rowData;
		for (var x = 0; x < tableModelDatos.getRowCount(); x++) {
			rowData = tableModelDatos.getRowData(x);
			rowData.desc_producto = data;
			for (var y in rowData.grupo) {
				rowData.grupo[y].desc_producto = data;
			}
			functionCalcular(x);
		}
	});
	this.add(txtDesc_producto, {left: 520, top: 45});
	this.add(new qx.ui.basic.Label("Desc.producto %: "), {left: 430, top: 50});
	
	
	var txtIva = new qx.ui.form.Spinner(0, 0, 100);
	txtIva.setWidth(50);
	txtIva.setNumberFormat(numberformatMontoEng);
	txtIva.getChildControl("upbutton").setVisibility("excluded");
	txtIva.getChildControl("downbutton").setVisibility("excluded");
	txtIva.setSingleStep(0);
	txtIva.setPageStep(0);
	txtIva.addListener("changeValue", function(e){
		var data = e.getData();
		var rowData;
		for (var x = 0; x < tableModelDatos.getRowCount(); x++) {
			rowData = tableModelDatos.getRowData(x);
			rowData.iva = data;
			for (var y in rowData.grupo) {
				rowData.grupo[y].iva = data;
			}
			functionCalcular(x);
		}
	});
	this.add(txtIva, {left: 680, top: 45});
	this.add(new qx.ui.basic.Label("I.V.A. %: "), {left: 630, top: 50});
	
	//this.add(new qx.ui.basic.Label("I.V.A.: " + model.producto.iva + "%"), {left: 700, top: 50});
	


	
	
	var commandHorizontal = new qx.ui.command.Command("Ctrl+Right");
	commandHorizontal.addListener("execute", function(e){
		tblDatos.edicion = "edicion_horizontal";
	});
	var commandVertical = new qx.ui.command.Command("Ctrl+Down");
	commandVertical.addListener("execute", function(e){
		tblDatos.edicion = "edicion_vertical";
	});
		
	var menu = new componente.general.ramon.ui.menu.Menu();
	var btnAplicar = new qx.ui.menu.Button("Aplicar valores grupo");
	btnAplicar.setEnabled(false);
	btnAplicar.addListener("execute", function(e){
		/*
		var x, y, z;
		var rowDataTarget;
		var focusedRow = tblDatos.getFocusedRow();
		var rowDataSource = tableModelDatos.getRowDataAsMap(focusedRow);
		delete rowDataSource.item;
		
		var selectedRanges = selectionModelDatos.getSelectedRanges();
		for (x in selectedRanges) {
			var selectedRange = selectedRanges[x];
			for (y = selectedRange.minIndex; y <= selectedRange.maxIndex; y++) {
				if (y != focusedRow) {
					rowDataTarget = tableModelDatos.getRowData(y);
					for (z in rowDataSource) rowDataTarget[z] = rowDataSource[z];
					tableModelDatos.setRowsAsMapArray([rowDataTarget], y, true);
					functionCalcular(y);
				}
			}
		}
		selectionModelDatos.setSelectionInterval(focusedRow, focusedRow);
		*/
	});
	
	var radiogroup = new qx.ui.form.RadioGroup();
	var btnHorizontal = new qx.ui.menu.RadioButton("Edición horizontal");
	btnHorizontal.setCommand(commandHorizontal);

	var btnVertical = new qx.ui.menu.RadioButton("Edición vertical");
	btnVertical.setValue(true);
	btnVertical.setCommand(commandVertical);
	radiogroup.add(btnHorizontal, btnVertical);
	

	//menu.add(btnAplicar);
	//menu.addSeparator();
	menu.add(btnHorizontal);
	menu.add(btnVertical);
	menu.memorizar();
	menu.desactivar();
	
	
	

		
		//Tabla Datos

		var tableModelDatos = new qx.ui.table.model.Simple();
		tableModelDatos.setColumns(["", "Color", "Capac.", "U", "P.lista", "Rem.CF.", "Desc.CF.", "Bonif.CF.", "Rem.may.", "Desc.may.", "Bonif.may.", "Desc.lista", "Comisión", "Cod.interno"], ["item", "color", "capacidad", "unidad", "precio_lista", "remarc_final", "desc_final", "bonif_final", "remarc_mayorista", "desc_mayorista", "bonif_mayorista", "desc_lista", "comision_vendedor", "cod_interno"]);
		//tableModelDatos.setEditable(true);
		
		tableModelDatos.setSortMethods(1, function(row1, row2) {
			var resultado;
			//if (row1[2].toLowerCase() == row2[2].toLowerCase()) {if (row1[3] == row2[3]) {if (row1[4].toLowerCase() == row2[4].toLowerCase()) {resultado = 0;} else resultado = ((row1[4].toLowerCase() > row2[4].toLowerCase()) ? 1 : -1);} else resultado = ((row1[3] > row2[3]) ? 1 : -1);} else resultado = ((row1[2].toLowerCase() > row2[2].toLowerCase()) ? 1 : -1);
			if (row1[1].toLowerCase() == row2[1].toLowerCase()) {if (row1[3].toLowerCase() == row2[3].toLowerCase()) {if (row1[2] == row2[2]) {resultado = 0;} else resultado = ((row1[2] > row2[2]) ? 1 : -1);} else resultado = ((row1[3].toLowerCase() > row2[3].toLowerCase()) ? 1 : -1);} else resultado = ((row1[1].toLowerCase() > row2[1].toLowerCase()) ? 1 : -1);
			return resultado;
		});


		tableModelDatos.setColumnEditable(4, true);
		tableModelDatos.setColumnEditable(5, true);
		tableModelDatos.setColumnEditable(6, true);
		tableModelDatos.setColumnEditable(7, true);
		tableModelDatos.setColumnEditable(8, true);
		tableModelDatos.setColumnEditable(9, true);
		tableModelDatos.setColumnEditable(10, true);
		tableModelDatos.setColumnEditable(11, true);
		tableModelDatos.setColumnEditable(12, true);

		tableModelDatos.setColumnSortable(0, false);
		tableModelDatos.setColumnSortable(1, false);
		tableModelDatos.setColumnSortable(2, false);
		tableModelDatos.setColumnSortable(3, false);
		tableModelDatos.setColumnSortable(4, false);
		tableModelDatos.setColumnSortable(5, false);
		tableModelDatos.setColumnSortable(6, false);
		tableModelDatos.setColumnSortable(7, false);
		tableModelDatos.setColumnSortable(8, false);
		tableModelDatos.setColumnSortable(9, false);
		tableModelDatos.setColumnSortable(10, false);
		tableModelDatos.setColumnSortable(11, false);
		tableModelDatos.setColumnSortable(12, false);
		tableModelDatos.setColumnSortable(13, false);
		
		
		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblDatos = this._tblDatos = new componente.general.ramon.ui.table.Table(tableModelDatos, custom);
		tblDatos.edicion = "edicion_vertical";
		//tblDatos.setWidth(815);
		//tblDatos.setHeight("30%");
		tblDatos.setShowCellFocusIndicator(true);
		tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
		tblDatos.modo = "normal";
		tblDatos.toggleColumnVisibilityButtonVisible();
		tblDatos.toggleStatusBarVisible();
		
		
		var tableColumnModelDatos = tblDatos.getTableColumnModel();
		
		var resizeBehavior = tableColumnModelDatos.getBehavior();
		resizeBehavior.set(0, {width:"2.5%", minWidth:100});
		resizeBehavior.set(1, {width:"21%", minWidth:100});
		resizeBehavior.set(2, {width:"6%", minWidth:100});
		resizeBehavior.set(3, {width:"3.5%"});
		resizeBehavior.set(4, {width:"7.5%", minWidth:100});
		resizeBehavior.set(5, {width:"7.5%", minWidth:100});
		resizeBehavior.set(6, {width:"6.5%", minWidth:100});
		resizeBehavior.set(7, {width:"6.5%", minWidth:100});
		resizeBehavior.set(8, {width:"6.5%", minWidth:100});
		resizeBehavior.set(9, {width:"6.5%", minWidth:100});
		resizeBehavior.set(10, {width:"6.5%", minWidth:100});
		resizeBehavior.set(11, {width:"6.5%", minWidth:100});
		resizeBehavior.set(12, {width:"6.5%", minWidth:100});
		resizeBehavior.set(13, {width:"6.5%", minWidth:100});
		
		
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
		
		
		var renderer = new qx.ui.table.cellrenderer.Number();
		renderer.setNumberFormat(numberformatMonto);
		tableColumnModelDatos.setDataCellRenderer(4, renderer);
		tableColumnModelDatos.setDataCellRenderer(5, renderer);
		tableColumnModelDatos.setDataCellRenderer(6, renderer);
		tableColumnModelDatos.setDataCellRenderer(7, renderer);
		tableColumnModelDatos.setDataCellRenderer(8, renderer);
		tableColumnModelDatos.setDataCellRenderer(9, renderer);
		tableColumnModelDatos.setDataCellRenderer(10, renderer);
		tableColumnModelDatos.setDataCellRenderer(11, renderer);
		tableColumnModelDatos.setDataCellRenderer(12, renderer);

		
		
		
		var celleditorString = new qx.ui.table.celleditor.TextField();
		celleditorString.setValidationFunction(function(newValue, oldValue){
			return newValue.trim();
		});
		//tableColumnModelDatos.setCellEditorFactory(9, celleditorString);
		//tableColumnModelDatos.setCellEditorFactory(10, celleditorString);
		//tableColumnModelDatos.setCellEditorFactory(11, celleditorString);
		
		var celleditorNumber = new qx.ui.table.celleditor.TextField();
		celleditorNumber.setValidationFunction(function(newValue, oldValue){
			newValue = newValue.trim();
			if (newValue == "") return oldValue;
			else if (isNaN(newValue)) return oldValue; else return newValue;
		});

		tableColumnModelDatos.setCellEditorFactory(4, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(5, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(6, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(7, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(8, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(9, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(10, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(11, celleditorNumber);
		tableColumnModelDatos.setCellEditorFactory(12, celleditorNumber);
		
		
		

		
	tblDatos.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value != data.oldValue) {
			var focusedRow = tblDatos.getFocusedRow();
			var columnId = tableModelDatos.getColumnId(tblDatos.getFocusedColumn());
			var rowData = tableModelDatos.getRowData(focusedRow);
			rowData[columnId] = data.value;
			for (var x in rowData.grupo) {
				rowData.grupo[x][columnId] = data.value;
			}
			functionCalcular(focusedRow);
		}
		/*
		if (data.value != data.oldValue) {
			var focusedRow = tblDatos.getFocusedRow();
			var columnId = tableModelDatos.getColumnId(tblDatos.getFocusedColumn());
			var rowData = tableModelDatos.getRowData(focusedRow);
			if (cgb.getValue()) {
				var indice = rowData.capacidad + " - " + rowData.id_unidad;
				for (var x in arrayGrupos[indice]) {
					arrayGrupos[indice][x][columnId] = data.value;
				}
			} else {
				rowData[columnId] = data.value;
			}
			functionCalcular(focusedRow);
		}
		*/
	});
	
		
		
		var selectionModelDatos = tblDatos.getSelectionModel();
		selectionModelDatos.addListener("changeSelection", function(e){
			if (selectionModelDatos.getSelectedCount() > 1) {
				btnAplicar.setEnabled(true);
				menu.memorizar([btnAplicar]);
			} else {
				btnAplicar.setEnabled(false);
				menu.memorizar([btnAplicar]);
			}
			//var bool = (selectionModelDatos.getSelectedCount() > 0);
			//if (bool) {
			
			tblCalculo.setFocusedCell(0, tblDatos.getFocusedRow(), true)
			//}
		});
		
		tblDatos.setContextMenu(menu);
		
	
		composite2.add(tblDatos, {left: 0, top: 10, right: 0, bottom: 0});
		
		
		
		
	var cgb = new qx.ui.groupbox.CheckGroupBox("Agrupar colores (*)");
	cgb.setLayout(new qx.ui.layout.Grow());
	cgb.setValue(false);
	//cgb.setWidth(159);
	//cgb.setHeight(203);
	//cgb.setMaxHeight(414);
	var cgb_changeValue = function(e) {
		var row;
		var arrayGrupos = [];
		
		tblDatos.resetSelection();
		tblDatos.setFocusedCell();
		tblCalculo.setFocusedCell();
		tableModelDatos.setDataAsMapArray([]);
		tableModelCalculo.setDataAsMapArray([]);
		
		for (var x = 0; x < model.producto_item.length; x++) {
			row = {};
			for (var z in model.producto_item[x]) row[z] = model.producto_item[x][z];
			row.item = 0

			if (cgb.getValue() && arrayColor[row.id_color].getValue()) {
				row.color = "*";
				row.cod_interno = "*";
				if (arrayGrupos[row.capacidad + " - " + row.id_unidad] == null) {
					row.grupo = arrayGrupos[row.capacidad + " - " + row.id_unidad] = [];
					tableModelDatos.addRowsAsMapArray([row], null, true);
					tableModelCalculo.addRowsAsMapArray([{item: 0, plmasiva: 0, costo: 0, pcfcd: 0, utilcf: 0, pmaycd: 0, utilmay: 0, comision: 0}], null);
				}
				arrayGrupos[row.capacidad + " - " + row.id_unidad].push(model.producto_item[x]);
			} else {
				row.grupo = [model.producto_item[x]];
				tableModelDatos.addRowsAsMapArray([row], null, true);
				tableModelCalculo.addRowsAsMapArray([{item: 0, plmasiva: 0, costo: 0, pcfcd: 0, utilcf: 0, pmaycd: 0, utilmay: 0, comision: 0}], null);
			}
		}
		
		tableModelDatos.sortByColumn(1, true);
		for (var x = 0; x < tableModelDatos.getRowCount(); x++) {
			tableModelDatos.setValueById("item", x, x + 1);
			tableModelCalculo.setValueById("item", x, x + 1);
			functionCalcular(x);
		}
		
		tblDatos.setFocusedCell(4, 0, true);
		tblCalculo.setFocusedCell(0, 0, true);
		if (cgb.getValue()) {
			tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
			tblDatos.modo = "especial";
		} else {
			tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
			tblDatos.modo = "normal";
		}
	}
	
	
/*
	cgb.addListener("changeValue", function(e){
		tblDatos.resetSelection();
		tblDatos.setFocusedCell();
		tblCalculo.setFocusedCell();
		if (e.getData()) {
			var row;
			var contador = 0;
			
			btnAceptar.setEnabled(false);
			tableModelDatos.setDataAsMapArray([]);
			tableModelCalculo.setDataAsMapArray([]);
			tableColumnModelDatos.setColumnVisible(1, true);
			tableColumnModelDatos.setColumnVisible(2, false);
			tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
			tblDatos.modo = "especial";
			arrayGrupos = [];
			for (var x = 0; x < producto.items.length; x++) {
				row = producto.items[x];
				if (arrayColor[row.id_color].getValue()) {
					if (arrayGrupos[row.capacidad + " - " + row.id_unidad]==null) {
						++contador;
						arrayGrupos[row.capacidad + " - " + row.id_unidad] = [];
						tableModelDatos.addRowsAsMapArray([row], null, true)
					}
					arrayGrupos[row.capacidad + " - " + row.id_unidad].push(row);
				}
			}
			if (tableModelDatos.getRowCount() > 0) {
				tableModelDatos.sortByColumn(3, true);
				for (var x = 0; x < tableModelDatos.getRowCount(); x++) {
					tableModelDatos.setValueById("item", x, x + 1);
					tableModelCalculo.addRowsAsMapArray([{item: x + 1, plmasiva: 0, costo: 0, pcfcd: 0, utilcf: 0, pmaycd: 0, utilmay: 0, comision: 0}], null, true);
					functionCalcular(x);
				}
				
				tblDatos.setFocusedCell(5, 0, true);
				tblCalculo.setFocusedCell(0, 0, true);
			}
		} else {
			tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);
			tblDatos.modo = "normal";
			tableColumnModelDatos.setColumnVisible(1, false);
			tableColumnModelDatos.setColumnVisible(2, true);
			tableModelDatos.setDataAsMapArray(producto.items, true);
			tableModelDatos.sortByColumn(2, true);
			tableModelCalculo.setDataAsMapArray([], true);
			for (var x = 0; x < producto.items.length; x++) {
				tableModelCalculo.addRowsAsMapArray([{item: x + 1, plmasiva: 0, costo: 0, pcfcd: 0, utilcf: 0, pmaycd: 0, utilmay: 0, comision: 0}], null, true);
				functionCalcular(x);
			}
			tblDatos.setFocusedCell(5, 0, true)
			tblCalculo.setFocusedCell(0, 0, true);
			btnAceptar.setEnabled(true);
		}
	});
*/
	
	var composite = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
	var scroll = new qx.ui.container.Scroll(composite);
	cgb.add(scroll);
	composite4.add(cgb, {left: 0, top: 10, right: 30, bottom: 0});
	

	
	
	
	
	var menu2 = new componente.general.ramon.ui.menu.Menu();
	var btnCalcPrecioFinal = new qx.ui.menu.RadioButton("calcula Precio Final");
	btnCalcPrecioFinal.setValue(true);
	btnCalcPrecioFinal.addListener("execute", function(e){

	});
	
	var radiogroup2 = new qx.ui.form.RadioGroup();
	var btnCalc2 = new qx.ui.menu.RadioButton("calcula 2");

	var btnCalc3 = new qx.ui.menu.RadioButton("calcula 3");

	radiogroup2.add(btnCalcPrecioFinal, btnCalc2, btnCalc3);

	menu2.add(btnCalcPrecioFinal);
	menu2.add(btnCalc2);
	menu2.add(btnCalc3);
	menu2.memorizar();
	//menu.desactivar();
		
		
		
		//Tabla Calculo

		var tableModelCalculo = new qx.ui.table.model.Simple();
		tableModelCalculo.setColumns(["", "P.lis.+IVA", "Costo", "Precio CF", "Util.CF", "Precio may.", "Util.may.", "Comisión"], ["item", "plmasiva", "costo", "pcfcd", "utilcf", "pmaycd", "utilmay", "comision"]);
		//tableModelCalculo.setEditable(true);
		tableModelCalculo.setColumnSortable(0, false);
		tableModelCalculo.setColumnSortable(1, false);
		tableModelCalculo.setColumnSortable(2, false);
		tableModelCalculo.setColumnSortable(3, false);
		tableModelCalculo.setColumnSortable(4, false);
		tableModelCalculo.setColumnSortable(5, false);
		tableModelCalculo.setColumnSortable(6, false);
		tableModelCalculo.setColumnSortable(7, false);
		
		tableModelCalculo.setColumnEditable(3, true);

		
		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblCalculo = new componente.general.ramon.ui.table.TableMonFilaColumna(tableModelCalculo, custom);
		tblCalculo.edicion = "edicion_vertical";
		//tblCalculo.setWidth(750);
		//tblCalculo.setHeight(184);
		tblCalculo.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tblCalculo.toggleColumnVisibilityButtonVisible();
		tblCalculo.toggleStatusBarVisible();
		tblCalculo.setContextMenu(menu2);

		var tooltip = new qx.ui.tooltip.ToolTip("");
		//tooltip.setWidth(200);
		tooltip.setRich(true);
		tblCalculo.setToolTip(tooltip);
		tblCalculo.addListener("mousemove", function(e){
			if (tblCalculo.fila != null && tblCalculo.columna !=null && tblCalculo.fila >= 0 && tblCalculo.columna > 0) {
				var rowData = tableModelCalculo.getRowData(tblCalculo.fila);
				tblCalculo.setBlockToolTip(false);
				//tooltip.setLabel(String(tableModelCalculo.getValue(tblCalculo.columna, tblCalculo.fila)));
				tooltip.setLabel(rowData["tooltip" + tblCalculo.columna]);
				//tooltip.placeToMouse(e);
				tooltip.placeToPointer(e);
				tooltip.show();
			} else {
				tooltip.setLabel("");
				//tooltip.exclude();
				tblCalculo.setBlockToolTip(true);
			}
		});
		
		var tableColumnModelCalculo = tblCalculo.getTableColumnModel();
		
		var resizeBehavior = tableColumnModelCalculo.getBehavior();
		resizeBehavior.set(0, {width:"3.4%", minWidth:100});
		resizeBehavior.set(1, {width:"13.8%", minWidth:100});
		resizeBehavior.set(2, {width:"13.8%", minWidth:100});
		resizeBehavior.set(3, {width:"13.8%", minWidth:100});
		resizeBehavior.set(4, {width:"13.8%", minWidth:100});
		resizeBehavior.set(5, {width:"13.8%", minWidth:100});
		resizeBehavior.set(6, {width:"13.8%", minWidth:100});
		resizeBehavior.set(7, {width:"13.8%", minWidth:100});
		
		
		tableColumnModelCalculo.setDataCellRenderer(1, renderer);
		tableColumnModelCalculo.setDataCellRenderer(2, renderer);
		tableColumnModelCalculo.setDataCellRenderer(3, renderer);
		tableColumnModelCalculo.setDataCellRenderer(4, renderer);
		tableColumnModelCalculo.setDataCellRenderer(5, renderer);
		tableColumnModelCalculo.setDataCellRenderer(6, renderer);
		tableColumnModelCalculo.setDataCellRenderer(7, renderer);
		
		/*
		tableColumnModelCalculo.setColumnWidth(0, 20);
		tableColumnModelCalculo.setColumnWidth(1, 86);
		tableColumnModelCalculo.setColumnWidth(2, 86);
		tableColumnModelCalculo.setColumnWidth(3, 86);
		tableColumnModelCalculo.setColumnWidth(4, 86);
		tableColumnModelCalculo.setColumnWidth(5, 86);
		tableColumnModelCalculo.setColumnWidth(6, 86);
		tableColumnModelCalculo.setColumnWidth(7, 86);
		*/
		

		tableColumnModelCalculo.setCellEditorFactory(3, celleditorNumber);
		
		
		
		
	tblCalculo.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value != data.oldValue) {
			var focusedRow = tblCalculo.getFocusedRow();
			var rowData = tableModelDatos.getRowData(focusedRow);
			
			var remarc_final = (1000000 * data.value - ((100 * rowData.bonif_final - 10000) * rowData.desc_final - 10000 * rowData.bonif_final + 1000000) * rowData.costo) / (((rowData.bonif_final - 100) * rowData.desc_final - 100 * rowData.bonif_final + 10000) * rowData.costo);
			rowData.remarc_final = remarc_final;

			tableModelDatos.setValueById("remarc_final", focusedRow, remarc_final);
			for (var x in rowData.grupo) {
				rowData.grupo[x].remarc_final = remarc_final;
			}
			
			functionCalcular(focusedRow);
		}
	});
		
		
		
		
		var selectionModelCalculo = tblCalculo.getSelectionModel();
		selectionModelCalculo.addListener("changeSelection", function(e){
			var bool = (selectionModelCalculo.getSelectedCount() > 0);
			if (bool) {
				var i = tblCalculo.getFocusedRow();
				tblDatos.setFocusedCell(tblDatos.getFocusedColumn(), i, true)
			}
		});
		
	
		composite5.add(tblCalculo, {left: 0, top: 10, right: 0, bottom: 0});
		
		
		
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		model.producto.serializer.agrupar = cgb.getValue();
		model.producto.serializer.colores = {};
		for (var x in arrayColor) {
			var id_color = arrayColor[x].getModel();
			model.producto.serializer.colores[id_color] = arrayColor[x].getValue();
		}

		
		var p = {};
		p.id_producto = id_producto;
		p.desc_producto = txtDesc_producto.getValue();
		p.iva = txtIva.getValue();
		
		p.id_fabrica = model.producto.id_fabrica;
		p.desc_fabrica = (original.desc_fabrica == txtDesc_fabrica.getValue()) ? null : txtDesc_fabrica.getValue();
		p.serializer = qx.lang.Json.stringify(model.producto.serializer);
		p.producto_item = [];
		
		var bandera;
		for (var x in model.producto_item) {
			bandera = false;
			
			for (var y in model.producto_item[x]) {
				if (model.producto_item[x][y] != original.producto_item[x][y]) bandera = true;
			}
			
			if (bandera) p.producto_item.push(model.producto_item[x]);
		}
		
		//alert(qx.lang.Json.stringify(p, null, 2));
		//alert(qx.lang.Json.stringify(p.producto_item, null, 2));
		
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
		rpc.setTimeout(1000 * 60 * 2);
		rpc.callAsync(qx.lang.Function.bind(function(resultado, error, id) {
			if (error != null) {
				dialog.Dialog.error("Ocurrió error inesperado: " + error.message + "<br/> Intente de nuevo.");
			} else {
				this.fireDataEvent("aceptado", resultado);
				this.destroy();
			}
		}, this), "grabar_precios", p);
		
		/*
		try {
			var resultado = rpc.callSync("grabar_precios", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
	
		this.fireDataEvent("aceptado", resultado);
		this.destroy();
		*/
	}, this);
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){ 
		dialog.Dialog.confirm("Cerrar ventana sin guardar datos?", function(e){
			if (e) contexto.destroy(); else btnCancelar.focus();
		});
	});
	
	this.add(btnAceptar, {left: "35%", bottom: 0});
	this.add(btnCancelar, {right: "35%", bottom: 0});
	
	
		
		
		var p = {};
		p.id_producto = id_producto;
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
		try {
			var resultado = rpc.callSync("leer_precios", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		

		model = resultado;
//		model.producto.serializer = qx.util.Json.parse(model.producto.serializer, false);
		model.producto.serializer = qx.lang.Json.parse(model.producto.serializer);
		
		original = {};
		original.producto_item = qx.lang.Json.parse(qx.lang.Json.stringify(model.producto_item));
		
		//alert(qx.lang.Json.stringify(original.producto_item, null, 2));
		
		
		

		//tableModelDatos.setDataAsMapArray(producto.items, true);
		//tableModelDatos.sortByColumn(2, true);
		//tblDatos.setFocusedCell(5, 0, true)
		//selectionModelDatos.setSelectionInterval(0, 0);

		for (var x = 0; x < model.producto_item.length; x++) {
			//tableModelCalculo.addRowsAsMapArray([{item: x + 1, plmasiva: 0, costo: 0, pcfcd: 0, utilcf: 0, pmaycd: 0, utilmay: 0, comision: 0}], null, true);
			//functionCalcular(x);
			
			if (! arrayColor[model.producto_item[x].id_color]) {
				var chk = new qx.ui.form.CheckBox(model.producto_item[x].color);
				
				if (model.producto.serializer.colores[model.producto_item[x].id_color]!=null) {
					chk.setValue(model.producto.serializer.colores[model.producto_item[x].id_color]);
				} else {
					chk.setValue(true);
				}
				
				chk.setModel(model.producto_item[x].id_color);
				chk.addListener("changeValue", function(e){cgb.fireDataEvent("changeValue", true);});
				composite.add(chk);
				arrayColor[model.producto_item[x].id_color] = chk;
			}
		}
		
	this.add(new qx.ui.basic.Label("Clasificación: "), {left: 0, top: 0});
	this.add(new qx.ui.basic.Label(clasificacion), {left: 70, top: 0});
	
	this.add(new qx.ui.basic.Label("Fábrica: "), {left: 0, top: 20});
	this.add(new qx.ui.basic.Label(model.producto.fabrica), {left: 70, top: 20});
	
	original.desc_fabrica = model.producto.desc_fabrica;
	
	txtDesc_fabrica.setValue(model.producto.desc_fabrica);
	txtDesc_producto.setValue(model.producto.desc_producto);
	txtIva.setValue(model.producto.iva);

	this.add(new qx.ui.basic.Label("Descripción: "), {left: 0, top: 50});
	this.add(new qx.ui.basic.Label(model.producto.descrip), {left: 70, top: 50});
	//this.add(new qx.ui.basic.Label("I.V.A.: " + model.producto.iva + "%"), {left: 700, top: 50});
		
		cgb.setValue(! model.producto.serializer.agrupar);
		cgb.addListener("changeValue", cgb_changeValue);
		cgb.setValue(model.producto.serializer.agrupar);
		
	

	txtDesc_fabrica.setTabIndex(1);
	txtDesc_producto.setTabIndex(2);
	txtIva.setTabIndex(3);
	tblDatos.setTabIndex(4);
	tblCalculo.setTabIndex(5);
	cgb.setTabIndex(6);
		
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});