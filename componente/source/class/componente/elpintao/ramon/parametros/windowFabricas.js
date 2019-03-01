qx.Class.define("componente.elpintao.ramon.parametros.windowFabricas",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
	this.base(arguments);
	
		this.set({
			caption: "Fábricas",
			width: 600,
			height: 600,
			showMinimize: false
		});
		
		this.setLayout(new qx.ui.layout.Grow());

	this.addListenerOnce("appear", function(e){
		tblFabrica.focus();
	});
	
	
	
	var application = qx.core.Init.getApplication();
	var numberformatMontoEs2 = new qx.util.format.NumberFormat("es").set({groupingUsed: true});
	
	
	
	
	
	
	
	
	var windowFabrica = new componente.elpintao.ramon.parametros.windowFabrica();
	windowFabrica.setModal(true);
	windowFabrica.addListener("disappear", function(e){
		tblFabrica.focus();
	});
	application.getRoot().add(windowFabrica);
	
	

	
	var tableModelFabrica = new qx.ui.table.model.Simple();
	tableModelFabrica.setColumns(["Descripción", "Descuento", "Comisión"], ["descrip", "desc_fabrica", "comision"]);
	tableModelFabrica.setColumnSortable(0, false);
	tableModelFabrica.setColumnSortable(1, false);
	tableModelFabrica.setColumnSortable(2, false);

	var tblFabrica = new componente.general.ramon.ui.table.tableParametro(tableModelFabrica, "fabrica", windowFabrica);
	
	var tableColumnModelFabrica = tblFabrica.getTableColumnModel();
	
	var cellrendererNumber = new qx.ui.table.cellrenderer.Number();
	cellrendererNumber.setNumberFormat(application.numberformatMontoEs);
	tableColumnModelFabrica.setDataCellRenderer(1, cellrendererNumber);
	tableColumnModelFabrica.setDataCellRenderer(2, cellrendererNumber);
	
	this.add(tblFabrica);
	
	

	
	
	},
	members : 
	{

	}
});