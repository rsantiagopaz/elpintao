qx.Class.define("elpintao.comp.varios.popupTransmision",
{
	extend : componente.general.ramon.ui.popup.Popup,
	construct : function (rowDataAcumulado)
	{
	this.base(arguments);
	
	this.set({
		width: 700,
		height: 200
	});
	
	this.setLayout(new qx.ui.layout.Grow());
	
	
	
	
	
	//Tabla

	var tableModel = this.tableModel = new qx.ui.table.model.Simple();
	tableModel.setColumns(["Hora", "Descripción", "Detalle"], ["hora", "descrip", "detalle"]);
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalle = this.tblDetalle = new componente.general.ramon.ui.table.Table(tableModel, custom);
	tblDetalle.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(false);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	//tblDetalle.edicion = "edicion_vertical";
	tblDetalle.toggleStatusBarVisible();
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);
	

	


      // Obtain the behavior object to manipulate

		var resizeBehavior = tableColumnModelDetalle.getBehavior();
		resizeBehavior.set(0, {width:"10%", minWidth:100});
		resizeBehavior.set(1, {width:"30%", minWidth:100});
		resizeBehavior.set(2, {width:"60%", minWidth:100});


		
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	
	
	this.add(tblDetalle);
	
	
	},
	members : 
	{

	}
});