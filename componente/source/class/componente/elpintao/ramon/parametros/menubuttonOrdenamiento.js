qx.Class.define("componente.elpintao.ramon.parametros.menubuttonOrdenamiento",
{
	extend : qx.ui.menu.Button,
	construct : function (table, tag, url, serviceName)
	{
	this.base(arguments, "Ordenamiento");

	
	var application = qx.core.Init.getApplication();
	
	var radiogroup = new qx.ui.form.RadioGroup();
	var btn_execute = function(e) {
		this.formula = e.getTarget().getUserData("listItem").getModel().formula;
		
		tableModel.setSortMethods(0, qx.lang.Function.bind(this.functionOrdenamiento, this));
		tableModel.setColumnSortable(0, true);
		tableModel.sortByColumn(0, true);
	}
	
	var functionGrabarIndices = function(model) {
		var p = model;
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Ordenamiento");
		try {
			var resultado = rpc.callSync("grabar_indices", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
	}
	
	

	
	var win = new componente.general.ramon.ui.window.Window();
	win.setLayout(new qx.ui.layout.Canvas());
	win.set({
		caption: "Fórmulas de ordenamiento",
		width: 500,
		height: 500,
		showMinimize: false,
		showMaximize: false
	});
	win.setModal(true);
	
	win.addListener("appear", function(){
		lstCampo.focus();
	});
	win.addListener("disappear", function(){
		btnSel.fireEvent("execute");
		table.focus();
	});
	this.getApplicationRoot().add(win);
	
	

	var commandEscape = new qx.ui.command.Command("Escape");
	commandEscape.addListener("execute", function(e){
		win.hide();
	});
	win.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);

	
	
	var menuMain = new qx.ui.menu.Menu();
	var btnEditar = new qx.ui.menu.Button("Editar...");
	btnEditar.addListener("execute", function(e){
		win.center();
		win.show();
	});
	menuMain.add(btnEditar);
	this.setMenu(menuMain);
	
	
	
	
	var commandCampo = new qx.ui.command.Command("Enter");
	commandCampo.setEnabled(false);
	commandCampo.addListener("execute", function(e){
		var selection = lstCampo.getSelection()[0];
		lstCampo.remove(selection);
		var listItem = new qx.ui.form.ListItem(selection.getLabel(), null, selection.getModel());
		lstSel.add(listItem);
		lstSel.setSelection([listItem]);
		lstCampo.focus();
	});
	var menuCampo = new componente.general.ramon.ui.menu.Menu();
	var btnCampo = new qx.ui.menu.Button("Pasar", null, commandCampo);
	menuCampo.add(btnCampo);
	menuCampo.memorizar();
	
	var lstCampo = new componente.general.ramon.ui.list.List();
	lstCampo.setContextMenu(menuCampo);
	lstCampo.addListener("changeSelection", function(e){
		commandCampo.setEnabled(! lstCampo.isSelectionEmpty());
		menuCampo.memorizar([commandCampo]);
	});
	lstCampo.addListener("dblclick", function(e){
		if (! lstCampo.isSelectionEmpty()) commandCampo.fireDataEvent("execute");
	});
	

	
	var menuSel = new componente.general.ramon.ui.menu.Menu();
	var btnSel = new qx.ui.menu.Button("Borrar todo");
	btnSel.addListener("execute", function(e){
		var selection;
		var indice;
		var bandera;
		var listItem;
		var childrenCampo;
		var childrenSel = lstSel.getChildren();
		for (var x = childrenSel.length - 1; x >= 0 ; x--) {
			selection = childrenSel[x];
			lstSel.remove(childrenSel[x]);
			indice = selection.getModel();
			listItem = new qx.ui.form.ListItem(selection.getLabel(), null, indice);
			
			childrenCampo = lstCampo.getChildren();
			bandera = true;
			for (var y in childrenCampo) {
				if (indice < childrenCampo[y].getModel()) {
					lstCampo.addBefore(listItem, childrenCampo[y]);
					bandera = false;
					break;
				}
			}
			if (bandera) lstCampo.add(listItem);
		}
		lstCampo.resetSelection();
	});
	var btnNuevaFor = new qx.ui.menu.Button("Generar nueva fórmula");
	btnNuevaFor.setEnabled(false);
	btnNuevaFor.addListener("execute", function(e){
		var children = lstSel.getChildren();
		var label = "";
		var auxFormula = "";
		var indice;
		for (var x = 0; x < children.length; x++) {
			label = label + " , " + children[x].getLabel();
			indice = children[x].getModel();
			//auxFormula = auxFormula + "if (row1[" + indice + "] == row2[" + indice + "]) {";
			auxFormula = auxFormula + "if (this.row1[" + indice + "] == this.row2[" + indice + "]) {";
		}
		
		label = label.substring(3);
		//auxFormula = auxFormula + "resultado = 0;";
		auxFormula = auxFormula + "this.resultado = 0;";
		for (var x = children.length - 1; x >= 0 ; x--) {
			indice = children[x].getModel();
			//auxFormula = auxFormula + "} else resultado = ((row1[" + indice + "] > row2[" + indice + "]) ? 1 : -1);"
			auxFormula = auxFormula + "} else this.resultado = ((this.row1[" + indice + "] > this.row2[" + indice + "]) ? 1 : -1);"
		}
		btnSel.fireEvent("execute");
		
		
		var model = {id_ordenamiento: 0, tag: tag, indice: lstFormula.getChildren().length, descrip: label, formula: auxFormula};
		var p = {};
		p.model = model;
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Ordenamiento");
		try {
			var resultado = rpc.callSync("agregar_item", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		model.id_ordenamiento = resultado;
		var listItem = new qx.ui.form.ListItem(label, null, model);
		lstFormula.add(listItem);
		lstFormula.setSelection([listItem]);

		var btn = new qx.ui.menu.RadioButton(label);
		btn.setUserData("listItem", listItem);
		btn.setGroup(radiogroup);
		btn.addListener("execute", btn_execute, this);
		menuMain.addAt(btn, lstFormula.indexOf(listItem));
		
		if (menuMain.getChildren().length == 2) {
			menuMain.addBefore(new qx.ui.menu.Separator(), btnEditar);
			btn.fireEvent("execute");
		}
	}, this);
	menuSel.add(btnSel);
	menuSel.addSeparator();
	menuSel.add(btnNuevaFor);
	menuSel.memorizar();
	
	var lstSel = new componente.general.ramon.ui.list.List();
	lstSel.setContextMenu(menuSel);
	lstSel.addListener("addItem", function(e){
		btnSel.setEnabled(true);
		btnNuevaFor.setEnabled(true);
		menuSel.memorizar([btnSel, btnNuevaFor]);
	});
	lstSel.addListener("removeItem", function(e){
		if (!lstSel.hasChildren()) {
			btnSel.setEnabled(false);
			btnNuevaFor.setEnabled(false);
			menuSel.memorizar([btnSel, btnNuevaFor]);
		}
	});
	
	
	var grp = new qx.ui.groupbox.GroupBox("Edición:");
	grp.setLayout(new qx.ui.layout.Canvas());
	grp.add(new qx.ui.basic.Label("Campos disponibles:"), {left: 0, top: 0});
	grp.add(lstCampo, {left: 0, top: 20, bottom: 0, width: "45%"});
	grp.add(new qx.ui.basic.Label("Nueva fórmula:"), {left: "55%", top: 0});
	grp.add(lstSel, {right: 0, top: 20, bottom: 0, width: "45%"});
	win.add(grp, {left: 0, top: 0, right: 0, bottom: "42%"});
	
	
	
	var menuFor = new componente.general.ramon.ui.menu.Menu();
	var btnSubir = new qx.ui.menu.Button("Subir");
	btnSubir.setEnabled(false);
	btnSubir.addListener("execute", function(e){
		var selection = lstFormula.getSelection()[0];
		var index = lstFormula.indexOf(selection);
		
		functionGrabarIndices({id_ordenamiento1: lstFormula.getChildren()[index-1].getModel().id_ordenamiento, id_ordenamiento2: selection.getModel().id_ordenamiento});
		
		lstFormula.addAt(selection, index - 1);
		lstFormula.fireDataEvent("changeSelection");
		
		selection = menuMain.getChildren()[index];
		menuMain.remove(selection);
		menuMain.addAt(selection, index - 1)
	});
	var btnBajar = new qx.ui.menu.Button("Bajar");
	btnBajar.addListener("execute", function(e){
		var selection = lstFormula.getSelection()[0];
		var index = lstFormula.indexOf(selection);
		
		functionGrabarIndices({id_ordenamiento1: selection.getModel().id_ordenamiento, id_ordenamiento2: lstFormula.getChildren()[index+1].getModel().id_ordenamiento});
		
		lstFormula.addAt(selection, index + 1);
		lstFormula.fireDataEvent("changeSelection");
		
		selection = menuMain.getChildren()[index];
		menuMain.remove(selection);
		menuMain.addAt(selection, index + 1)
	});
	btnBajar.setEnabled(false);
	var btnEliminar = new qx.ui.menu.Button("Eliminar");
	btnEliminar.setEnabled(false);
	btnEliminar.addListener("execute", function(e){
		var selection = lstFormula.getSelection()[0];
		menuMain.removeAt(lstFormula.indexOf(selection));
		radiogroup.remove(selection);
		lstFormula.remove(selection);
		
		var p = {};
		p.id_ordenamiento = selection.getModel().id_ordenamiento;
		var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Ordenamiento");
		try {
			var resultado = rpc.callSync("eliminar_item", p);
		} catch (ex) {
			alert("Sync exception: " + ex);
		}
		
		if (lstFormula.hasChildren()) {
			menuMain.getChildren()[0].fireEvent("execute");
		} else {
			menuMain.removeAt(0);
			tableModel.clearSorting()
			tableModel.setColumnSortable(0, false);
			tableModel.setSortMethods(0, null);
		}
		lstFormula.focus();
	});
	
	menuFor.add(btnSubir);
	menuFor.add(btnBajar);
	menuFor.addSeparator();
	menuFor.add(btnEliminar);
	menuFor.memorizar();
	
	
	var lstFormula = new qx.ui.form.List();
	lstFormula.setContextMenu(menuFor);
	lstFormula.addListener("changeSelection", function(e){
		if (lstFormula.isSelectionEmpty()) {
			btnSubir.setEnabled(false);
			btnBajar.setEnabled(false);
			btnEliminar.setEnabled(false);
		} else {
			var index = lstFormula.indexOf(lstFormula.getSelection()[0]);
			btnSubir.setEnabled(index!=0);
			btnBajar.setEnabled(index!=lstFormula.getChildren().length - 1);
			btnEliminar.setEnabled(true);
		}
	});
	
	
	win.add(new qx.ui.basic.Label("Fórmulas de ordenamiento:"), {left: 0, top: "61%"});
	win.add(lstFormula, {left: 0, top: "65%", right: 0, bottom: 0});
	
	var tableModel = table.getTableModel();
	
	for (var x = 0; x < tableModel.getColumnCount(); x++) {
		var listItem = new qx.ui.form.ListItem(tableModel.getColumnName(x), null, x);
		lstCampo.add(listItem);
		tableModel.setColumnSortable(x, false);
	}
	
	
	
	var p = {};
	p.tag = tag;
	var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Ordenamiento");
	try {
		var resultado = rpc.callSync("leer_items", p);
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	for (var x in resultado) {
		var listItem = new qx.ui.form.ListItem(resultado[x].descrip, null, resultado[x]);
		lstFormula.add(listItem);

		var btn = new qx.ui.menu.RadioButton(resultado[x].descrip);
		btn.setUserData("listItem", listItem);
		btn.setGroup(radiogroup);
		btn.addListener("execute", btn_execute, this);
		menuMain.addAt(btn, lstFormula.indexOf(listItem));
	}
	var children = menuMain.getChildren();
	if (children.length > 1) {
		menuMain.addBefore(new qx.ui.menu.Separator(), btnEditar);
		children[0].fireEvent("execute");
	}

	
	},
	members : 
	{
		row1: null,
		row2: null,
		formula: null,
		resultado: null,

		functionOrdenamiento: function(par1, par2) {
			this.row1 = par1;
			this.row2 = par2;

			eval(this.formula);

			return this.resultado;
		}
	}
});