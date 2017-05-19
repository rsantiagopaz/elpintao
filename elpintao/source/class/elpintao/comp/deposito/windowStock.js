qx.Class.define("elpintao.comp.deposito.windowStock",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (rowDataAcumulado)
	{
	this.base(arguments);
	
	this.set({
		caption: "Enviar",
		width: 400,
		height: 300,
		showMinimize: false,
		showMaximize: false
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		if (rowDataAcumulado.stock.length > 0) {
			tblDetalle.setFocusedCell(2, 0, true);
			tblDetalle.focus();
			tblDetalle.startEditing();
		}		
	});
	
	var contexto = this;
	var total = rowDataAcumulado.enviar;
	
	var sumar = function() {
		var data = tableModelDetalle.getDataAsMapArray();
		total = 0;
		for (var x in data) {
			total = total + data[x].enviar;
		}
		tblDetalle.setAdditionalStatusBarText("Total a enviar: " + total);
	}


	//Menu de contexto Detalle
	
	var commandNuevoDetalle = new qx.ui.command.Command("Insert");
	commandNuevoDetalle.addListener("execute", function(){

	});
	
	var menutblDetalle = new componente.general.ramon.ui.menu.Menu();
	var btnNuevoDetalle = new qx.ui.menu.Button("Alta item...", null, commandNuevoDetalle); 
	var btnEliminarDetalle = new qx.ui.menu.Button("Eliminar item");
	btnEliminarDetalle.setEnabled(false);
	btnEliminarDetalle.addListener("execute", function(e){

	});
	menutblDetalle.add(btnNuevoDetalle);
	menutblDetalle.addSeparator();
	menutblDetalle.add(btnEliminarDetalle);
	menutblDetalle.memorizar();
	commandNuevoDetalle.setEnabled(false);
	

	//Tabla

	var tableModelDetalle = this.tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Sucursal", "Stock", "Enviar"], ["sucursal_descrip", "stock", "enviar"]);
	tableModelDetalle.setColumnEditable(2, true);
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalle = new componente.general.ramon.ui.table.Table(tableModelDetalle, custom);
	tblDetalle.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(true);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.edicion = "edicion_vertical";
	//tblDetalle.toggleStatusBarVisible();
	
	tblDetalle.addListener("dataEdited", function(e){
		var data = e.getData();
		if (data.value > tableModelDetalle.getValueById("stock", data.row)) {
			tableModelDetalle.setValueById("enviar", data.row, 0);
		}
		sumar();
	});
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	

	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		//resizeBehavior.set(0, {width:"7%", minWidth:100});
		//resizeBehavior.set(1, {width:"47%", minWidth:100});
		//resizeBehavior.set(2, {width:"7%", minWidth:100});


		
	tblDetalle.setContextMenu(menutblDetalle);
	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	selectionModelDetalle.addListener("changeSelection", function(e){
		btnEliminarDetalle.setEnabled(! selectionModelDetalle.isSelectionEmpty());
		menutblDetalle.memorizar([btnEliminarDetalle]);
	});
	
	
	this.add(tblDetalle, {left:0, top: 30, right: 0, bottom: 50});
	
	tblDetalle.setAdditionalStatusBarText("Total a enviar: " + total);
	
	//this.add(tblPedido, {left:0 , top: 20, right: 0, height: "40%"});
	
	//this.add(new qx.ui.basic.Label("Detalle:"), {left: 0, top: "47%"});
	
	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		var data = tableModelDetalle.getDataAsMapArray();
		for (var x in data) {
			tableModelDetalle.getRowData(x).enviar = data[x].enviar;
		}
		rowDataAcumulado.enviar = total;

		this.fireDataEvent("aceptado");
		btnCancelar.fireEvent("execute");
	}, this);
	this.add(btnAceptar, {left: 70, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 270, bottom: 0})
	
	tableModelDetalle.setDataAsMapArray(rowDataAcumulado.stock, true);


	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});