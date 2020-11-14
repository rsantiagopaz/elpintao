qx.Class.define("elpintao.comp.parametros.windowUnirFabrica",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);

		this.set({
			caption: "Unir fábrica",
			width: 800,
			height: 600,
			showMinimize: false,
			showMaximize: false
		});
		this.setLayout(new qx.ui.layout.Canvas());
		
	this.addListenerOnce("appear", function(e){
		slbOrigen.focus();
	});
		

	var application = qx.core.Init.getApplication();

	
	
	var form = new qx.ui.form.Form();
	
	
	var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
	try {
		var resultado = rpc.callSync("autocompletarFabrica", {texto: ""});
	} catch (ex) {
		alert("Sync exception: " + ex);
	}
	
	
	var slbOrigen = this.slbOrigen = new qx.ui.form.SelectBox();
	slbOrigen.setWidth(300);
	slbOrigen.setHeight(23);
	
	slbOrigen.add(new qx.ui.form.ListItem(" ", null, "0"));
	for (var x in resultado) {
		slbOrigen.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	slbOrigen.addListener("changeSelection", function(e){
		var p = {};
		p.id_fabrica = slbOrigen.getModelSelection().getItem(0);
		
        var timer = qx.util.TimerManager.getInstance();
        // check for the old listener
        if (this.timerId != null) {
          // stop the old one
          timer.stop(this.timerId);
          if (this.rpc != null) this.rpc.abort(this.reference);
          this.timerId = null;
        }
        // start a new listener to update the controller
		this.timerId = timer.start(function(userData, timerId) {
			this.rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
			this.rpc.addListener("completed", function(e){
				var resultado = e.getData().result;
				
				tableModelOrigen.setDataAsMapArray(resultado, true);

				this.rpc = null;
				this.timerId = null;
			}, this);
			
			this.reference = this.rpc.callAsyncListeners(true, "buscar_productos", p);
		}, null, this, null, 200);
	});
	
	/*
	form.add(slbOrigen, "Fab. origen", function(value) {
		if (slbOrigen.getModelSelection().getItem(0) == "0") throw new qx.core.ValidationError("Validation Error", "Debe seleccionar fábrica origen");
	}, "id_fabrica_origen");
	*/
	
	form.add(slbOrigen, "Fab. origen", null, "id_fabrica_origen");
	
	this.add(new qx.ui.basic.Label("Fábrica origen: "), {left: 0, top: 3});
	this.add(slbOrigen, {left: 80, top: 0});
	



	
	
	

	
	var slbDestino = this.slbDestino = new qx.ui.form.SelectBox();
	slbDestino.setWidth(300);
	slbDestino.setHeight(23);
	
	slbDestino.add(new qx.ui.form.ListItem(" ", null, "0"));
	for (var x in resultado) {
		slbDestino.add(new qx.ui.form.ListItem(resultado[x].label, null, resultado[x].model));
	}
	slbDestino.addListener("changeSelection", function(e){
		var p = {};
		p.id_fabrica = slbDestino.getModelSelection().getItem(0);
		
        var timer = qx.util.TimerManager.getInstance();
        // check for the old listener
        if (this.timerId != null) {
          // stop the old one
          timer.stop(this.timerId);
          if (this.rpc != null) this.rpc.abort(this.reference);
          this.timerId = null;
        }
        // start a new listener to update the controller
		this.timerId = timer.start(function(userData, timerId) {
			this.rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
			this.rpc.addListener("completed", function(e){
				var resultado = e.getData().result;
				
				tableModelDestino.setDataAsMapArray(resultado, true);

				this.rpc = null;
				this.timerId = null;
			}, this);
			
			this.reference = this.rpc.callAsyncListeners(true, "buscar_productos", p);
		}, null, this, null, 200);
	});
	
	/*
	form.add(slbOrigen, "Fab. origen", function(value) {
		if (slbOrigen.getModelSelection().getItem(0) == "0") throw new qx.core.ValidationError("Validation Error", "Debe seleccionar fábrica origen");
	}, "id_fabrica_origen");
	*/
	
	form.add(slbDestino, "Fab. destino", null, "id_fabrica_destino");
	
	this.add(new qx.ui.basic.Label("Fábrica destino: "), {left: 0, top: 253});
	this.add(slbDestino, {left: 80, top: 250});
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	var cboOrigen = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Reparacion", "autocompletarFabrica");
	cboOrigen.setWidth(300);
	cboOrigen.setInvalidMessage("Debe seleccionar una fábrica origen");
	var lstOrigen = cboOrigen.getChildControl("list");
	lstOrigen.addListener("changeSelection", function(e){
		if (lstOrigen.isSelectionEmpty()) {
			tableModelOrigen.setDataAsMapArray([], true);
		} else {
			var p = {};
			p.id_fabrica = lstOrigen.getModelSelection().getItem(0);
			
	        var timer = qx.util.TimerManager.getInstance();
	        // check for the old listener
	        if (this.timerId != null) {
	          // stop the old one
	          timer.stop(this.timerId);
	          if (this.rpc != null) this.rpc.abort(this.reference);
	          this.timerId = null;
	        }
	        // start a new listener to update the controller
			this.timerId = timer.start(function(userData, timerId) {
				this.rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
				this.rpc.addListener("completed", function(e){
					var resultado = e.getData().result;
					
					tableModelOrigen.setDataAsMapArray(resultado, true);

					this.rpc = null;
					this.timerId = null;
				}, this);
				
				this.reference = this.rpc.callAsyncListeners(true, "buscar_productos", p);
			}, null, this, null, 200);
		}
	});
	
	form.add(cboOrigen, "Fab. origen", function(value) {
		if (lstOrigen.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar fábrica origen");
	}, "origen");
	form.add(lstOrigen, "", null, "id_fabrica_origen");
	
	this.add(new qx.ui.basic.Label("Fábrica origen: "), {left: 0, top: 3});
	this.add(cboOrigen, {left: 80, top: 0});
	*/
	

	
	/*
	var cboDestino = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Reparacion", "autocompletarFabrica");
	cboDestino.setWidth(300);
	cboDestino.setInvalidMessage("Debe seleccionar una fábrica destino");
	var lstDestino = cboDestino.getChildControl("list");
	lstDestino.addListener("changeSelection", function(e){
		if (lstDestino.isSelectionEmpty()) {
			tableModelDestino.setDataAsMapArray([], true);
		} else {
			var p = {};
			p.id_fabrica = lstDestino.getModelSelection().getItem(0);
			
	        var timer = qx.util.TimerManager.getInstance();
	        // check for the old listener
	        if (this.timerId != null) {
	          // stop the old one
	          timer.stop(this.timerId);
	          if (this.rpc != null) this.rpc.abort(this.reference);
	          this.timerId = null;
	        }
	        // start a new listener to update the controller
			this.timerId = timer.start(function(userData, timerId) {
				this.rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
				this.rpc.addListener("completed", function(e){
					var resultado = e.getData().result;
					
					tableModelDestino.setDataAsMapArray(resultado, true);

					this.rpc = null;
					this.timerId = null;
				}, this);
				
				this.reference = this.rpc.callAsyncListeners(true, "buscar_productos", p);
			}, null, this, null, 200);
		}
	});
	
	form.add(cboDestino, "Fab. destino", function(value) {
		if (lstDestino.isSelectionEmpty()) throw new qx.core.ValidationError("Validation Error", "Debe seleccionar fábrica destino");
	}, "destino");
	form.add(lstDestino, "", null, "id_fabrica_destino");
	
	this.add(new qx.ui.basic.Label("Fábrica destino: "), {left: 0, top: 253});
	this.add(cboDestino, {left: 80, top: 250});
	*/
	
	
	
	
	form.getValidationManager().setValidator(function(items, manager){
		var bandera = true;
		slbOrigen.setValid(true);
		slbDestino.setValid(true);
		
		if (slbOrigen.getModelSelection().getItem(0) == "0") {
			slbOrigen.setInvalidMessage("Debe seleccionar fábrica origen");
			slbOrigen.setValid(false);
			
			bandera = false;
		}
		
		if (slbDestino.getModelSelection().getItem(0) == "0") {
			slbDestino.setInvalidMessage("Debe seleccionar fábrica destino");
			slbDestino.setValid(false);
			
			bandera = false;
		}
		
		if (slbOrigen.getModelSelection().getItem(0) == slbDestino.getModelSelection().getItem(0)) {
			slbDestino.setInvalidMessage("Debe seleccionar fábrica destino distinta a origen");
			slbDestino.setValid(false);
			
			bandera = false;
		}
		
		return bandera;
	});
	
	
	
	
	//Tabla

	var tableModelOrigen = new qx.ui.table.model.Simple();
	tableModelOrigen.setColumns(["Producto", "Capacidad", "U", "Color"], ["producto", "capacidad", "unidad", "color"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};

	var tblOrigen = new componente.general.ramon.ui.table.Table(tableModelOrigen, custom);
	tblOrigen.setShowCellFocusIndicator(false);
	tblOrigen.toggleColumnVisibilityButtonVisible();
	tblOrigen.toggleStatusBarVisible();
	tblOrigen.setHeight(200);

	
	var tableColumnModelOrigen = tblOrigen.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	var resizeBehavior = tableColumnModelOrigen.getBehavior();
	resizeBehavior.set(0, {width:"50%", minWidth:100});
	resizeBehavior.set(1, {width:"10%", minWidth:100});
	resizeBehavior.set(2, {width:"10%", minWidth:100});
	resizeBehavior.set(3, {width:"30%", minWidth:100});

	var selectionModelOrigen = tblOrigen.getSelectionModel();
	selectionModelOrigen.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);

	this.add(tblOrigen, {left:0 , top: 30, right: 0});

	
	
	
	
	
	//Tabla

	var tableModelDestino = new qx.ui.table.model.Simple();
	tableModelDestino.setColumns(["Producto", "Capacidad", "U", "Color"], ["producto", "capacidad", "unidad", "color"]);

	var custom = {tableColumnModel : function(obj) {
		return new qx.ui.table.columnmodel.Resize(obj);
	}};

	var tblDestino = new componente.general.ramon.ui.table.Table(tableModelDestino, custom);
	tblDestino.setShowCellFocusIndicator(false);
	tblDestino.toggleColumnVisibilityButtonVisible();
	tblDestino.toggleStatusBarVisible();
	tblDestino.setHeight(200);

	
	var tableColumnModelDestino = tblDestino.getTableColumnModel();
	//tableColumnModelPedido.setColumnWidth(0, 65);
	//tableColumnModelPedido.setColumnWidth(1, 65);
	var resizeBehavior = tableColumnModelDestino.getBehavior();
	resizeBehavior.set(0, {width:"50%", minWidth:100});
	resizeBehavior.set(1, {width:"10%", minWidth:100});
	resizeBehavior.set(2, {width:"10%", minWidth:100});
	resizeBehavior.set(3, {width:"30%", minWidth:100});

	var selectionModelDestino = tblDestino.getSelectionModel();
	selectionModelDestino.setSelectionMode(qx.ui.table.selection.Model.SINGLE_SELECTION);

	this.add(tblDestino, {left:0 , top: 280, right: 0});
	
	
	
	
	
	var btnAceptar = new qx.ui.form.Button("Unir");
	btnAceptar.addListener("execute", function(e){
		if (form.validate()) {
			/*
			dialog.Dialog.confirm("Desea proceder con la unión y eliminar la fábrica '" + lstOrigen.getSelection()[0].getLabel() + "' ?", function(e){
				if (e) {
					var model = qx.util.Serializer.toNativeObject(controllerForm.createModel());
					
					var p = {};
					p.id_fabrica_origen = model.id_fabrica_origen;
					p.id_fabrica_destino = model.id_fabrica_destino;
					
					var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
					try {
						//var resultado = rpc.callSync("buscar_productos");
					} catch (ex) {
						alert("Sync exception: " + ex);
					}
					
					cboOrigen.resetValue();
					cboDestino.resetValue();
					
					cboOrigen.focus();
				}
			});
			*/
			
			(new dialog.Confirm({
				"message"     : "Desea proceder con la unión y eliminar la fábrica '" + slbOrigen.getSelection()[0].getLabel() + "' ?",
				"callback"    : function(e){
									if (e) {
										var p = {};
										p.id_fabrica_origen = slbOrigen.getModelSelection().getItem(0);
										p.id_fabrica_destino = slbDestino.getModelSelection().getItem(0);
										
										var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Reparacion");
										try {
											var resultado = rpc.callSync("unir_fabrica", p);
										} catch (ex) {
											alert("Sync exception: " + ex);
										}
										
										slbOrigen.setModelSelection(["0"]);
										slbDestino.setModelSelection(["0"]);
										
										slbOrigen.focus();
									}
								},
				"context"     : null,
				"image"       : "icon/48/status/dialog-warning.png"
			})).show();
		} else {
			form.getValidationManager().getInvalidFormItems()[0].focus();
		}
	});
	
	var btnCancelar = new qx.ui.form.Button("Cerrar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	
	this.add(btnAceptar, {left: "30%", bottom: 0});
	this.add(btnCancelar, {right: "30%", bottom: 0});
	
	
	
	slbOrigen.setTabIndex(1);
	tblOrigen.setTabIndex(2);
	slbDestino.setTabIndex(3);
	tblDestino.setTabIndex(4);
	btnAceptar.setTabIndex(5);
	btnCancelar.setTabIndex(6);
	
		
	},
	members : 
	{

	}
});