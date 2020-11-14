qx.Class.define("elpintao.comp.productos.popupProducto",
{
  extend : qx.ui.popup.Popup,
  construct : function (tableParamed)
  {
	this.base(arguments, new qx.ui.layout.Canvas());
	
	this.set({
		offsetLeft : -7,
		width: 620 + 14,
		height: 400
	});
	
	
	var application = qx.core.Init.getApplication();
	
	

	var commandEscape = new qx.ui.command.Command("Escape");
	commandEscape.addListener("execute", function(e){
		this.hide();
	}, this);
	this.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);

		
	var commandSeleccionar = new qx.ui.command.Command("Enter");
	commandSeleccionar.setEnabled(false);
	commandSeleccionar.addListener("execute", function(e){
		var rowData = tableModel.getRowData(tbl.getFocusedRow());
		this.hide();
		this.fireDataEvent("seleccionado", rowData);
	}, this);
		
	var menu = new componente.general.ramon.ui.menu.Menu();
	
	menu.addListener("appear", function(e){
		menu.setZIndex(this.getZIndex() + 1);
	}, this);
	var btnSeleccionar = new qx.ui.menu.Button("Seleccionar", null, commandSeleccionar);
	menu.add(btnSeleccionar);
	menu.memorizar();

		
	var txtBuscar = new qx.ui.form.TextField("");
	txtBuscar.setPlaceholder("Buscar");
	txtBuscar.addListener("input", function(e){
		var texto = txtBuscar.getValue().trim();
		if (texto=="") {
			tbl.clearFocusedRowHighlight();
			tableModel.setDataAsMapArray([], true);
		} else {
			var p = {};
			p.descrip = texto;
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Productos");
			try {
				var resultado = rpc.callSync("buscar_productos", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			//tbl.clearFocusedRowHighlight();
			//selectionModel.resetSelection();
			tableModel.setDataAsMapArray(resultado, true);
			if (resultado.length > 0) tbl.setFocusedCell(0, 0, true);
		}
	});
	txtBuscar.addListener("keypress", function(e){
		if (e.getKeyIdentifier()=="Down") tbl.focus();
	});
	
	this.add(txtBuscar, {left: 5, top: 5, right: 5});
		
		
		//Tabla

		var tableModel = new qx.ui.table.model.Simple();
		tableModel.setColumns(["Producto", "Capacidad", "Color", "Unidad", "P.lis.", "P.lis.+IVA"], ["producto", "capacidad", "color", "unidad", "precio_lista", "plmasiva"]);

		var custom = {tableColumnModel : function(obj) {
			return new qx.ui.table.columnmodel.Resize(obj);
		}};
		
		var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);

		tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
		tbl.toggleShowCellFocusIndicator();
		tbl.toggleColumnVisibilityButtonVisible();
		tbl.toggleStatusBarVisible();

		
		var tableColumnModel = tbl.getTableColumnModel();
		var resizeBehavior = tableColumnModel.getBehavior();
		resizeBehavior.set(0, {width:"50%", minWidth:100});
		resizeBehavior.set(1, {width:"10%", minWidth:100});
		resizeBehavior.set(2, {width:"10%", minWidth:100});
		resizeBehavior.set(3, {width:"10%", minWidth:100});
		resizeBehavior.set(4, {width:"10%", minWidth:100});
		resizeBehavior.set(5, {width:"10%", minWidth:100});
		
		
		
		var selectionModel = tbl.getSelectionModel();
		selectionModel.addListener("changeSelection", function(){
			var bool = (selectionModel.getSelectedCount() > 0);
			commandSeleccionar.setEnabled(bool);
			menu.memorizar([commandSeleccionar]);
		});
		
/*
		tbl.addListener("focus", function(e){
			var t = e.getTarget();
			if (t.getTableModel().getRowCount() > 0) {
				var i = t.getFocusedRow();
				t.getSelectionModel().setSelectionInterval(i, i);
			}
		});
		tbl.addListener("blur", function(e){e.getTarget().resetSelection();});
*/		
		tbl.addListener("cellDbltap", function(e){
			commandSeleccionar.fireDataEvent("execute", null);
		});
		

		
		

				
		this.add(tbl, {left: 5, top: 35, right: 5, bottom: 5});
		tbl.setContextMenu(menu);

		
		
	
		
		this.addListener("appear", function(e){
			txtBuscar.focus();
		});
		this.addListener("disappear", function(e){
			txtBuscar.setValue("");
			tableModel.setDataAsMapArray([], true);
			//this.removeListenerById(this.eventoSeleccionado);
		});
		
		
		
		
		
		
	},
	members : 
	{

	},
	events : 
	{
		"seleccionado": "qx.event.type.Event"
	}
});