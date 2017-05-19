qx.Class.define("elpintao.comp.productos.compositeVisorHistoricoPrecio",
{
	extend : qx.ui.tabview.Page,
	construct : function ()
	{
	this.base(arguments);

	this.setLayout(new qx.ui.layout.Canvas());
	this.addListenerOnce("appear", function(e){
		tblItem.focus();
		radiogroupPlot.addListener("changeSelection", function(e){
			functionDibujar();
		});
	}, this);

	
	var application = qx.core.Init.getApplication();
	var plot, plotData, yaxisPlot = {min: 0, tickOptions: {formatString: '$ %.2f'}}, titlePlot = "Precio lista";;

	var numberformatMonto = new qx.util.format.NumberFormat("es");
	numberformatMonto.setGroupingUsed(false);
	numberformatMonto.setMaximumFractionDigits(2);
	numberformatMonto.setMinimumFractionDigits(2);
	
	
	var functionLeer_historico = function(rowItem) {
		var year, month, date, hour, min;
		var rowHistorico, rowNuevo;
		var rowAnterior = {desc_fabrica: null, desc_producto: null, iva: null, precio_lista: null, remarc_final: null, desc_final: null, bonif_final: null, remarc_mayorista: null, desc_mayorista: null, bonif_mayorista: null, comision_vendedor: null};
		
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Historico_precio");
		try {
			var resultado = rpc.callSync("leer_historico", {id_producto_item: rowItem.id_producto_item});
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		for (var y in resultado) {
			rowHistorico = resultado[y];
			rowHistorico.fecha = rowHistorico.fecha.substr(0, 16);
			
			year = parseFloat(rowHistorico.fecha.substr(0, 4));
			month = parseFloat(rowHistorico.fecha.substr(5, 2)) - 1;
			date = parseFloat(rowHistorico.fecha.substr(8, 2));
			hour = parseFloat(rowHistorico.fecha.substr(11, 2));
			min = parseFloat(rowHistorico.fecha.substr(14, 2));
			
			rowHistorico.fecha_objeto = new Date(year, month, date, hour, min);
			
			rowNuevo = {fecha: rowHistorico.fecha};
			if (rowHistorico.desc_fabrica == rowAnterior.desc_fabrica) rowNuevo.desc_fabrica = null; else rowNuevo.desc_fabrica = rowAnterior.desc_fabrica = rowHistorico.desc_fabrica;
			if (rowHistorico.desc_producto == rowAnterior.desc_producto) rowNuevo.desc_producto = null; else rowNuevo.desc_producto = rowAnterior.desc_producto = rowHistorico.desc_producto;
			if (rowHistorico.iva == rowAnterior.iva) rowNuevo.iva = null; else rowNuevo.iva = rowAnterior.iva = rowHistorico.iva;
			if (rowHistorico.precio_lista == rowAnterior.precio_lista) rowNuevo.precio_lista = null; else rowNuevo.precio_lista = rowAnterior.precio_lista = rowHistorico.precio_lista;
			if (rowHistorico.remarc_final == rowAnterior.remarc_final) rowNuevo.remarc_final = null; else rowNuevo.remarc_final = rowAnterior.remarc_final = rowHistorico.remarc_final;
			if (rowHistorico.desc_final == rowAnterior.desc_final) rowNuevo.desc_final = null; else rowNuevo.desc_final = rowAnterior.desc_final = rowHistorico.desc_final;
			if (rowHistorico.bonif_final == rowAnterior.bonif_final) rowNuevo.bonif_final = null; else rowNuevo.bonif_final = rowAnterior.bonif_final = rowHistorico.bonif_final;
			if (rowHistorico.remarc_mayorista == rowAnterior.remarc_mayorista) rowNuevo.remarc_mayorista = null; else rowNuevo.remarc_mayorista = rowAnterior.remarc_mayorista = rowHistorico.remarc_mayorista;
			if (rowHistorico.desc_mayorista == rowAnterior.desc_mayorista) rowNuevo.desc_mayorista = null; else rowNuevo.desc_mayorista = rowAnterior.desc_mayorista = rowHistorico.desc_mayorista;
			if (rowHistorico.bonif_mayorista == rowAnterior.bonif_mayorista) rowNuevo.bonif_mayorista = null; else rowNuevo.bonif_mayorista = rowAnterior.bonif_mayorista = rowHistorico.bonif_mayorista;
			if (rowHistorico.comision_vendedor == rowAnterior.comision_vendedor) rowNuevo.comision_vendedor = null; else rowNuevo.comision_vendedor = rowAnterior.comision_vendedor = rowHistorico.comision_vendedor;
			
			rowHistorico.formateado = rowNuevo;
		}
		
		rowItem.historico = resultado;
	}
	

	var functionDibujar = qx.lang.Function.bind(function() {
		var punto, rowData, rbtDatos;
		var rowCount = tableModelItem.getRowCount();
		plot.destroy();
		plotData.data = [];

		rbtDatos = radiogroupPlot.getSelection()[0].getUserData("datos");
		
		titlePlot = radiogroupPlot.getSelection()[0].getLabel();
		yaxisPlot = rbtDatos.yaxis;
		
		if (rowCount == 0) {
			plotData.data = [[0]];
		} else {
			for (var x = 0; x < rowCount; x++) {
				rowData = tableModelItem.getRowData(x);
				plotData.data[x] = [];
				
				for (var y in rowData.historico) {
					if (rowData.historico[y].formateado[rbtDatos.model] != null) {
						punto = [];
						punto.push(rowData.historico[y].fecha_objeto);
						punto.push(rowData.historico[y][rbtDatos.model]);
						plotData.data[x].push(punto);
					}
				}
			}
		}

		plot = new qxjqplot.Plot(plotData.data, plotData.options, plotData.plugins);
		plot.setContextMenu(menuPlot);

		this.add(plot, {left: 0, top: "25.5%", right: 0, bottom: 0});
		
	}, this);
	
	

	
	
	var menuPlot = new componente.general.ramon.ui.menu.Menu();
	
	var radiogroupPlot = new qx.ui.form.RadioGroup();
	
	var btnDescFabrica = new qx.ui.menu.RadioButton("Desc.fábrica");
	btnDescFabrica.setUserData("datos", {model: "desc_fabrica", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnIva = new qx.ui.menu.RadioButton("I.V.A.");
	btnIva.setUserData("datos", {model: "iva", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnDescProducto = new qx.ui.menu.RadioButton("Desc.producto");
	btnDescProducto.setUserData("datos", {model: "desc_producto", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnPrecioLista = new qx.ui.menu.RadioButton("Precio lista");
	btnPrecioLista.setUserData("datos", {model: "precio_lista", yaxis: {min: 0, tickOptions: {formatString: '$ %.2f'}}});
	btnPrecioLista.setValue(true);
	
	var btnRemarcFinal = new qx.ui.menu.RadioButton("Remarc.final");
	btnRemarcFinal.setUserData("datos", {model: "remarc_final", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnRemarcMayorista = new qx.ui.menu.RadioButton("Remarc.mayorista");
	btnRemarcMayorista.setUserData("datos", {model: "remarc_mayorista", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnDescFinal = new qx.ui.menu.RadioButton("Desc.final");
	btnDescFinal.setUserData("datos", {model: "desc_final", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnDescMayorista = new qx.ui.menu.RadioButton("Desc.mayorista");
	btnDescMayorista.setUserData("datos", {model: "desc_mayorista", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	var btnBonifFinal = new qx.ui.menu.RadioButton("Bonif.final");
	btnBonifFinal.setUserData("datos", {model: "bonif_final", yaxis: {min: 0, tickOptions: {formatString: '$ %.2f'}}});
	
	var btnBonifMayorista = new qx.ui.menu.RadioButton("Bonif.mayorista");
	btnBonifMayorista.setUserData("datos", {model: "bonif_mayorista", yaxis: {min: 0, tickOptions: {formatString: '$ %.2f'}}});
	
	var btnComision = new qx.ui.menu.RadioButton("Comision");
	btnComision.setUserData("datos", {model: "comision_vendedor", yaxis: {min: 0, tickOptions: {formatString: '%.2f %'}}});
	
	radiogroupPlot.add(btnDescFabrica, btnIva, btnDescProducto, btnPrecioLista, btnRemarcFinal, btnRemarcMayorista, btnDescFinal, btnDescMayorista, btnBonifFinal, btnBonifMayorista, btnComision);
	
	menuPlot.add(btnDescFabrica);
	menuPlot.add(btnIva);
	menuPlot.add(btnDescProducto);
	menuPlot.add(btnPrecioLista);
	menuPlot.add(btnRemarcFinal);
	menuPlot.add(btnRemarcMayorista);
	menuPlot.add(btnDescFinal);
	menuPlot.add(btnDescMayorista);
	menuPlot.add(btnBonifFinal);
	menuPlot.add(btnBonifMayorista);
	menuPlot.add(btnComision);
		
	plotData = {
		data: [[0]],
		options: function($jqplot){return {
			title: titlePlot,
			axes: {
				xaxis: {
					renderer: $jqplot.DateAxisRenderer,
					tickOptions: {
						//formatString:'%b&nbsp;%#d'
					}
				},
				yaxis: yaxisPlot
			},
			highlighter: {
				show: true,
				sizeAdjust: 7.5
			},
			cursor: {
				zoom: true,
				show: true
			}
		}},
		//plugins: ['highlighter','dragable', 'dateAxisRenderer', 'trendline', 'cursor']
		plugins: ['highlighter', 'dateAxisRenderer', 'cursor']
	};
        
	plot = new qxjqplot.Plot(plotData.data, plotData.options, plotData.plugins);
	plot.setContextMenu(menuPlot);

	this.add(plot, {left: 0, top: "25.5%", right: 0, bottom: 0});
	
	
	
	
	
	
	
	var menuItem = new componente.general.ramon.ui.menu.Menu();

	var commandAgregarItem = new qx.ui.command.Command("Insert");
	commandAgregarItem.addListener("execute", function(e){
		var win = new componente.elpintao.ramon.historico_precio.windowProducto("Agregar item");
		win.addListener("aceptado", function(e){
			var data = e.getData();
			if (tblItem.buscar("id_producto_item", data.id_producto_item) == null) {
				functionLeer_historico(data);
				tableModelItem.addRowsAsMapArray([data], null, true);
				tblItem.buscar("id_producto_item", data.id_producto_item);
				
				functionDibujar();
			}
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var commandEliminarItem = new qx.ui.command.Command("Del");
	commandEliminarItem.setEnabled(false);
	commandEliminarItem.addListener("execute", function(e){
		var focusedRow = tblItem.getFocusedRow();
		tblItem.blur();
		tableModelDatos.setDataAsMapArray([]);
		tableModelItem.removeRows(focusedRow, 1);
		
		functionDibujar();
		
		var rowCount = tableModelItem.getRowCount();
		if (focusedRow <= rowCount - 1) tblItem.setFocusedCell(0, focusedRow, true); else tblItem.setFocusedCell(0, rowCount - 1, true);
		tblItem.focus();
	});
	
	var btnAgregarItem = new qx.ui.menu.Button("Agregar item...", null, commandAgregarItem);
	var btnEliminarItem = new qx.ui.menu.Button("Eliminar item...", null, commandEliminarItem);
	
	menuItem.add(btnAgregarItem);
	menuItem.add(btnEliminarItem);
	menuItem.memorizar();

	
	
	
	//Tabla

	var tableModelItem = new qx.ui.table.model.Simple();
	tableModelItem.setColumns(["Fábrica", "Producto", "Capac.", "U", "Color"], ["fabrica", "producto", "capacidad", "unidad", "color"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblItem = new componente.general.ramon.ui.table.Table(tableModelItem, custom);
	tblItem.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	tblItem.toggleColumnVisibilityButtonVisible();
	tblItem.toggleShowCellFocusIndicator();
	tblItem.toggleStatusBarVisible();
	tblItem.setContextMenu(menuItem);
	
	var tableColumnModel = tblItem.getTableColumnModel();

  // Obtain the behavior object to manipulate
	var resizeBehavior = tableColumnModel.getBehavior();
	resizeBehavior.set(0, {width:"20%", minWidth:100});
	resizeBehavior.set(1, {width:"45%", minWidth:100});
	resizeBehavior.set(2, {width:"10%", minWidth:100});
	resizeBehavior.set(3, {width:"5%", minWidth:100});
	resizeBehavior.set(4, {width:"20%", minWidth:100});
	
	//resizeBehavior.set(0, {width:"10%", minWidth:100});
	//resizeBehavior.set(1, {width:"18%", minWidth:100});
	//resizeBehavior.set(2, {width:"8%", minWidth:100});
	//resizeBehavior.set(3, {width:"4%"});
	//resizeBehavior.set(4, {width:"8%", minWidth:100});

	var selectionModelItem = tblItem.getSelectionModel();
	selectionModelItem.addListener("changeSelection", function(e){
		if (selectionModelItem.isSelectionEmpty()) {
			commandEliminarItem.setEnabled(false);
		} else {
			var rowData = tableModelItem.getRowData(tblItem.getFocusedRow());
			commandEliminarItem.setEnabled(true);
			
			tableModelDatos.setDataAsMapArray([], true);

			for (var y in rowData.historico) {
				tableModelDatos.addRowsAsMapArray([rowData.historico[y].formateado], 0);
			}
		}
		menuItem.memorizar([commandEliminarItem]);
	});

	this.add(tblItem, {left: 0, top: 0, right: "60.2%", bottom: "75%"});
	
	
	

	
		//Tabla Datos

		var tableModelDatos = new qx.ui.table.model.Simple();
		tableModelDatos.setColumns(["Fecha", "Desc.fábrica", "Desc.produc.", "I.V.A.", "Precio lista", "Remarc.CF.", "Desc.CF.", "Bonif.CF.", "Remarc.may.", "Desc.may.", "Bonif.may.", "Comisión"], ["fecha", "desc_fabrica", "desc_producto", "iva", "precio_lista", "remarc_final", "desc_final", "bonif_final", "remarc_mayorista", "desc_mayorista", "bonif_mayorista", "comision_vendedor"]);
		
		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tblDatos = new componente.general.ramon.ui.table.Table(tableModelDatos, custom);
		tblDatos.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tblDatos.toggleColumnVisibilityButtonVisible();
		tblDatos.toggleStatusBarVisible();
		
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
		
		var tableColumnModelDatos = tblDatos.getTableColumnModel();
		
		var resizeBehavior = tableColumnModelDatos.getBehavior();
		resizeBehavior.set(0, {width:"13%", minWidth:100});
		resizeBehavior.set(1, {width:"8.5%", minWidth:100});
		resizeBehavior.set(2, {width:"9%", minWidth:100});
		resizeBehavior.set(3, {width:"5%", minWidth:100});
		resizeBehavior.set(4, {width:"7.5%", minWidth:100});
		resizeBehavior.set(5, {width:"8.5%", minWidth:100});
		resizeBehavior.set(6, {width:"7.5%", minWidth:100});
		resizeBehavior.set(7, {width:"7.5%", minWidth:100});
		resizeBehavior.set(8, {width:"9.5%", minWidth:100});
		resizeBehavior.set(9, {width:"7.5%", minWidth:100});
		resizeBehavior.set(10, {width:"7.5%", minWidth:100});
		resizeBehavior.set(11, {width:"7.5%", minWidth:100});
		
		
		var renderer = new qx.ui.table.cellrenderer.Number();
		renderer.setNumberFormat(numberformatMonto);
		tableColumnModelDatos.setDataCellRenderer(1, renderer);
		tableColumnModelDatos.setDataCellRenderer(2, renderer);
		tableColumnModelDatos.setDataCellRenderer(3, renderer);
		tableColumnModelDatos.setDataCellRenderer(4, renderer);
		tableColumnModelDatos.setDataCellRenderer(5, renderer);
		tableColumnModelDatos.setDataCellRenderer(6, renderer);
		tableColumnModelDatos.setDataCellRenderer(7, renderer);
		tableColumnModelDatos.setDataCellRenderer(8, renderer);
		tableColumnModelDatos.setDataCellRenderer(9, renderer);
		tableColumnModelDatos.setDataCellRenderer(10, renderer);
		tableColumnModelDatos.setDataCellRenderer(11, renderer);
		
		


		
		var selectionModelDatos = tblDatos.getSelectionModel();
		selectionModelDatos.addListener("changeSelection", function(e){

		});
		
		this.add(tblDatos, {left: "40.2%", top: 0, right: 0, bottom: "75%"});
		

		
	
	},
	members : 
	{

	}
});