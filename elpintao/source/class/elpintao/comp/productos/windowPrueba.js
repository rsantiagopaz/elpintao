qx.Class.define("elpintao.comp.productos.windowPrueba",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);
		
		this.set({
			caption: "Prueba",
			width: 1020,
			height: 570,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){

	});
		
	
	var application = qx.core.Init.getApplication();

	
	//Tabla

	var tableModelDetalle = new qx.ui.table.model.Simple();
	tableModelDetalle.setColumns(["Sucursal", "Stock", "Enviar"], ["sucursal_descrip", "stock", "enviar"]);
	tableModelDetalle.setColumnEditable(2, true);
	
	//tableModelDetalle.setEditable(true);
	//tableModelDetalle.setColumnEditable(4, true);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};
	
	var tblDetalle = new componente.general.ramon.ui.table.Table(tableModelDetalle, custom);
	//var tblDetalle = new qx.ui.table.Table(tableModelDetalle, custom);
	//tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.setShowCellFocusIndicator(true);
	tblDetalle.toggleColumnVisibilityButtonVisible();
	tblDetalle.edicion = "edicion_vertical";
	//tblDetalle.toggleStatusBarVisible();
	
	
	var tableColumnModelDetalle = tblDetalle.getTableColumnModel();
	//tableColumnModelDetalle.setColumnVisible(7, false);

  // Obtain the behavior object to manipulate

	var resizeBehavior = tableColumnModelDetalle.getBehavior();
	//resizeBehavior.set(0, {width:"7%", minWidth:100});
	//resizeBehavior.set(1, {width:"47%", minWidth:100});
	//resizeBehavior.set(2, {width:"7%", minWidth:100});

	
	var selectionModelDetalle = tblDetalle.getSelectionModel();
	selectionModelDetalle.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
	
	
	this.add(tblDetalle, {left: 10, top: 10, right: 10, bottom: 10});
	
	
	var datos = [{sucursal_descrip: "suc1", stock: 10, enviar: 0}, {sucursal_descrip: "suc2", stock: 20, enviar: 0}];
	tableModelDetalle.setDataAsMapArray(datos, true);
	
	
	
		
	},
	members : 
	{
	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});