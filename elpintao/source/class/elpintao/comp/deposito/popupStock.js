qx.Class.define("elpintao.comp.deposito.popupStock",
{
	extend : componente.general.ramon.ui.popup.Popup,
	construct : function (rowDataAcumulado)
	{
	this.base(arguments);
	
	this.set({
		width: 400,
		height: 200
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	
	this.addListenerOnce("appear", function(e){
		if (rowDataAcumulado.stock.length > 0) {
			tblDetalle.setFocusedCell(2, 0, true);
			tblDetalle.focus();
			qx.event.Timer.once(function(){
				commandEditar.execute();
			}, this, 20);
		}		
	});
	this.addListenerOnce("disappear", function(e){
		var data = tableModelDetalle.getDataAsMapArray();
		for (var x in data) {
			tableModelDetalle.getRowData(x).enviar = data[x].enviar;
		}
		rowDataAcumulado.enviar = total;
	});
	

	
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
	
	var commandEditar = new qx.ui.command.Command("F2");
	commandEditar.setEnabled(false);
	commandEditar.addListener("execute", function(e){
		tblDetalle.setFocusedCell(2, tblDetalle.getFocusedRow(), true);
		tblDetalle.startEditing();
	});
	
	var menutblDetalle = new componente.general.ramon.ui.menu.Menu();
	menutblDetalle.addListener("appear", function(e){
  		menutblDetalle.setZIndex(this.getZIndex() + 1);
  		this.setAutoHide(false);
	}, this);
	menutblDetalle.addListener("disappear", function(e){
  		this.setAutoHide(true);
	}, this);
	var btnEditar = new qx.ui.menu.Button("Editar", null, commandEditar);
	menutblDetalle.add(btnEditar);
	menutblDetalle.memorizar();
	

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
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(true);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.edicion = "edicion_vertical";
	//tblDetalle.toggleStatusBarVisible();
	tblDetalle.setContextMenu(menutblDetalle);
	tblDetalle.setAdditionalStatusBarText("Total a enviar: " + total);
	
	tblDetalle.addListener("cellDbltap", function(e){
		commandEditar.execute();
	});
	tblDetalle.addListener("dataEdited", function(e){
		var data = e.getData();
		var value = data.value;
		
		if (isNaN(value) || value < 0) value = data.oldValue;
		if (value > tableModelDetalle.getValueById("stock", data.row)) {
			// anulado temporalmente el control de stock en los envios hasta que den el ok
			//tableModelDetalle.setValueById("enviar", data.row, 0);
		}
		
		tableModelDetalle.setValueById("enviar", data.row, value);
		
		sumar();
	});
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);

  // Obtain the behavior object to manipulate

	var resizeBehavior = tableColumnModelDetalle.getBehavior();
	//resizeBehavior.set(0, {width:"7%", minWidth:100});
	//resizeBehavior.set(1, {width:"47%", minWidth:100});
	//resizeBehavior.set(2, {width:"7%", minWidth:100});

	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	selectionModelDetalle.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	selectionModelDetalle.addListener("changeSelection", function(e){
		commandEditar.setEnabled(! selectionModelDetalle.isSelectionEmpty());
		menutblDetalle.memorizar([commandEditar]);
	});
	
	
	this.add(tblDetalle, {left: 3, top: 3, right: 3, bottom: 3});
	
	
	
	tableModelDetalle.setDataAsMapArray(rowDataAcumulado.stock, true);
	
	
	var commandEscape = new qx.ui.command.Command("Escape");
	commandEscape.addListener("execute", function(e){
		if (tblDetalle.isEditing()) {
			tblDetalle.cancelEditing();
			tblDetalle.focus();
		} else this.hide();
	}, this);
	this.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);

	
	},
	members : 
	{

	}
});