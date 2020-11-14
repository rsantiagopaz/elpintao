qx.Class.define("elpintao.comp.cuentas.windowPrincipal",
{
  extend : qx.ui.window.Window,
  construct : function ()
  {
	this.base(arguments);
		
	this.set({
		caption: "Cuentas",
		width: 920,
		height: 470,
		showMinimize: false,
		showMaximize: false
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
		
	
	this.addListenerOnce("appear", function(e){

	});
	


qx.Mixin.define("my.Mixin",
{
  properties: {
    parentNode: {init: null, nullable: true, event: "parentNode"}
  }
});


var application = qx.core.Init.getApplication();
var contexto = this;
var nodoActual = null;
var rowDataActual = null;
var nodes = null;
	


this.add(new qx.ui.basic.Label("Sucursal: "), {left: 0, top: 5});

var slbSucursal = new qx.ui.form.SelectBox();
slbSucursal.setWidth(200);
slbSucursal.addListener("changeSelection", function(e){
	tbl.setFocusedCell();
	
	var p = {};
	p.id_sucursal = e.getData()[0].getModel();
	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
	rpc.callAsync(function(resultado, error, id){
		tableModel.setDataAsMapArray(resultado, true);
		vtUbicacion.setModel(null);
	}, "leer_cuentas", p);

	//alert(qx.lang.Json.stringify(resultado, null, 2));
	//var nodes = resultado[0];
});
this.add(slbSucursal, {left: 60, top: 0});

















	



	var menu2 = new componente.general.ramon.ui.menu.Menu();
	var btnNuevo2 = new qx.ui.menu.Button("Nueva cuenta");
	btnNuevo2.addListener("execute", function(e){
		var win = new elpintao.comp.cuentas.windowNuevo("Nueva cuenta", "");
		win.addListener("aceptado", function(e){
			var p = {};
			p.id_cuenta = "0";
			p.descrip = win.txt.getValue();
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
			try {
				var resultado = rpc.callSync("alta_modifica_cuenta", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			slbSucursal.fireDataEvent("changeSelection", slbSucursal.getSelection());
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnEditar2 = new qx.ui.menu.Button("Editar");
	btnEditar2.setEnabled(false);
	btnEditar2.addListener("execute", function(e){
		var win = new elpintao.comp.cuentas.windowNuevo("Editar cuenta", rowDataActual.descrip);
		win.addListener("aceptado", function(e){
			var p = {};
			p.id_cuenta = rowDataActual.id_cuenta;
			p.descrip = win.txt.getValue();
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
			try {
				var resultado = rpc.callSync("alta_modifica_cuenta", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			slbSucursal.fireDataEvent("changeSelection", slbSucursal.getSelection());
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnMarcar = new qx.ui.menu.Button("Marcar/Desmarcar");
	btnMarcar.setEnabled(false);
	btnMarcar.addListener("execute", function(e){
		var focusedRow = tbl.getFocusedRow();
		var rowData = tableModel.getRowData(focusedRow);
		rowData.marcado = ! rowData.marcado;
		
		var p = {};
		p.id_sucursal_cuenta = rowData.id_sucursal_cuenta;
		p.marcado = rowData.marcado;
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
		try {
			var resultado = rpc.callSync("escribir_sucursal_cuenta", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		tableModel.setValueById("marcado", focusedRow, rowData.marcado);
	});
	
	var btnEliminar2 = new qx.ui.menu.Button("Eliminar");
	btnEliminar2.setEnabled(false);
	btnEliminar2.addListener("execute", function(e){
		dialog.Dialog.confirm("Desea eliminar la cuenta seleccionada?", function(e){
			if (e) {
				var p = {};
				p.id_cuenta = rowDataActual.id_cuenta;
				
				var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
				try {
					var resultado = rpc.callSync("eliminar_cuenta", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				slbSucursal.fireDataEvent("changeSelection", slbSucursal.getSelection());
			}
		});
	});
	
	menu2.add(btnMarcar);
	menu2.addSeparator();
	menu2.add(btnNuevo2);
	menu2.add(btnEditar2);
	menu2.addSeparator();
	menu2.add(btnEliminar2);
	menu2.memorizar();



	
		
//Tabla

var tableModel = new qx.ui.table.model.Simple();
tableModel.setColumns(["", "Cuenta"], ["marcado", "descrip"]);
//tableModel.setEditable(true);
//tableModel.setColumnEditable(0, true);

var custom = {tableColumnModel : function(obj) {
	return new qx.ui.table.columnmodel.Resize(obj);
}};

var tbl = new componente.general.ramon.ui.table.Table(tableModel, custom);
tbl.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);
tbl.setShowCellFocusIndicator(false);
tbl.toggleColumnVisibilityButtonVisible();
tbl.toggleStatusBarVisible();

var tableColumnModel = tbl.getTableColumnModel();
var resizeBehavior = tableColumnModel.getBehavior();
resizeBehavior.set(0, {width:"10%", minWidth:100});
resizeBehavior.set(1, {width:"90%", minWidth:100});



var cellrendererBool = new qx.ui.table.cellrenderer.Boolean();
tableColumnModel.setDataCellRenderer(0, cellrendererBool);

var celleditorChk = new qx.ui.table.celleditor.CheckBox();
tableColumnModel.setCellEditorFactory(0, celleditorChk);



var selectionModel = tbl.getSelectionModel();
selectionModel.addListener("changeSelection", function(){
	var bool = (selectionModel.getSelectedCount() > 0);
	btnEditar2.setEnabled(bool);
	btnMarcar.setEnabled(bool);
	btnEliminar2.setEnabled(bool);
	menu2.memorizar([btnEditar2, btnMarcar, btnEliminar2]);
	
	if (bool) {
		rowDataActual = tableModel.getRowData(tbl.getFocusedRow())
		var p = {};
		p.id_padre = "0";
		p.id_sucursal = slbSucursal.getSelection()[0].getModel();
		p.id_cuenta = rowDataActual.id_cuenta;
		
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
		try {
			var resultado = rpc.callSync("leer_tipos_gastos", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		//alert(qx.lang.Json.stringify(resultado, null, 2));
		
		marshal.toClass(resultado[0], true);
		nodes = marshal.toModel(resultado[0]);
		vtUbicacion.setModel(nodes);
		functionPrepare(nodes, null);
	}
});






tbl.setContextMenu(menu2);


tbl.addListener("cellDbltap", function(e){
	btnMarcar.execute();
});
		
		

	this.add(tbl, {left: 0, top: 30, right: "50.5%", bottom: 0});
	

	
	
	
	
	var menu1 = new componente.general.ramon.ui.menu.Menu();
	var btnNuevo1 = new qx.ui.menu.Button("Nuevo tipo de gasto");
	btnNuevo1.setEnabled(false);
	btnNuevo1.addListener("execute", function(e){
		var win = new elpintao.comp.cuentas.windowNuevo("Nuevo tipo gasto", "");
		win.addListener("aceptado", function(e){
			var p = {};
			p.id_tipo_gasto = "0";
			p.id_padre = nodoActual.get("id_tipo_gasto");
			p.descrip = win.txt.getValue();
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
			try {
				var resultado = rpc.callSync("alta_modifica_tipo_gasto", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			tbl.focus();
			vtUbicacion.focus();
			//selectionModel.fireEvent("changeSelection");
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	var btnEditar1 = new qx.ui.menu.Button("Editar");
	btnEditar1.setEnabled(false);
	btnEditar1.addListener("execute", function(e){
		var win = new elpintao.comp.cuentas.windowNuevo("Editar tipo de gasto", nodoActual.get("descrip"));
		win.addListener("aceptado", function(e){
			var p = {};
			p.id_tipo_gasto = nodoActual.get("id_tipo_gasto");
			p.descrip = win.txt.getValue();
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
			try {
				var resultado = rpc.callSync("alta_modifica_tipo_gasto", p);
			} catch (ex) {
				alert("Sync exception: " + ex);
			}
			
			tbl.focus();
			vtUbicacion.focus();
		});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();
	});
	
	menu1.add(btnNuevo1);
	menu1.add(btnEditar1);
	menu1.memorizar();




var functionPrepare = function(nodo, parent) {
	nodo.set("parentNode", parent);
	nodo.addListener("changeMarcado", function(e){
		var p = {};
		p.id_cuenta_tipo_gasto = this.get("id_cuenta_tipo_gasto");
		p.marcado = e.getData();
		//alert(qx.lang.Json.stringify(p, null, 2));
		var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
		try {
			var resultado = rpc.callSync("escribir_cuenta_tipo_gasto", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
	})
	
	var hijos = nodo.get("hijos");
	var length = hijos.getLength();
	for (var x=0; x < length; x++) {
		functionPrepare(hijos.getItem(x), nodo);
	}

	vtUbicacion.openNode(nodo);
}

var delegateMarshal = {
	getModelMixins: function(properties) {
		return my.Mixin;
	}
}

var marshal = new qx.data.marshal.Json(delegateMarshal);

var delegateTree = {
	bindItem : function(controller, item, id) { 
		controller.bindDefaultProperties(item, id);
		controller.bindProperty("importe", "importe", null, item, id);
		controller.bindProperty("marcado", "marcado", null, item, id);
		controller.bindPropertyReverse("marcado", "marcado", null, item, id);
		controller.bindProperty("id_tipo_gasto", "chk_visibility", {
			converter : function(data) {
				return (data=="1") ? "hidden" : "visible";
			}
		}, item, id);
	},
	createItem : function(item) 
	{ 
		return new elpintao.comp.cuentas.VirtualTreeItem();
	}
}

var iconOptions = {
    converter : function(value, model)
    {
        if (value.getLength()==0) {
          return "icon/16/mimetypes/office-document.png";
        }
    }
}



var vtUbicacion = new componente.general.ramon.ui.tree.VirtualTree();
vtUbicacion.setDelegate(delegateTree);
vtUbicacion.setLabelPath("descrip");
vtUbicacion.setChildProperty("hijos");
vtUbicacion.setIconPath("hijos");
vtUbicacion.setIconOptions(iconOptions);
vtUbicacion.setWidth(300);
vtUbicacion.setContextMenu(menu1);

vtUbicacion.addListener("close", function(e){
	var data = e.getData();
	if (data.get("id_tipo_gasto")=="1") vtUbicacion.openNode(data);
});

vtUbicacion.addListener("focus", function(e){
	if (tbl.isEditing()) tbl.stopEditing();
});

vtUbicacion.getSelection().addListener("change", function(e){
	//tableModel.setDataAsMapArray(vtUbicacion.getSelection().getItem(0).get("cuenta"), true)
	var selection = vtUbicacion.getSelection();
	if (selection.getLength() > 0) {
		nodoActual = vtUbicacion.getSelection().getItem(0);
		btnNuevo1.setEnabled(true);
		btnEditar1.setEnabled(! (nodoActual.get("id_tipo_gasto")=="1"));
	} else {
		nodoActual = null;
		btnNuevo1.setEnabled(false);
		btnEditar1.setEnabled(false);
	}
	menu1.memorizar([btnNuevo1, btnEditar1]);
});

this.add(vtUbicacion, {left: "50.5%", top: 30, right: 0, bottom: 0});
	
	
	
	
	
	
	
	
var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Cuentas");
try {
	var resultado = rpc.callSync("leer_sucursales");
} catch (ex) {
	alert("Sync exception: " + ex);
}

for (var x in resultado) {
	var item = new qx.ui.form.ListItem(resultado[x].descrip, null, resultado[x].id_sucursal);
	slbSucursal.add(item);
}



	
		
  },
  members : 
  {

  }
});