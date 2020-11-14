qx.Class.define("componente.elpintao.ramon.parametros.windowFabrica",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (caption, icon)
	{
	this.base(arguments);
	
	this.set({
		width: 310,
		height: 200,
		showMinimize: false,
		showMaximize: false,
		allowMaximize: false,
		resizable: false
	});
		
	this.setLayout(new qx.ui.layout.Canvas());

	this.addListener("appear", function(e){
		txtDescrip.focus();
		txtDescrip.selectAllText();
	}, this);
	
	
	var application = qx.core.Init.getApplication();
	
	
	
	
	var form = new qx.ui.form.Form();
	
	var txtDescrip = new qx.ui.form.TextField("");
	txtDescrip.setRequired(true);
	txtDescrip.setMinWidth(200);
	txtDescrip.addListener("blur", function(e){
		this.setValue(this.getValue().trim());
	});
	form.add(txtDescrip, "Descripción", null, "descrip");
	
	var txtDesc_fabrica = new qx.ui.form.Spinner(0, 0, 100);
	txtDesc_fabrica.setEnabled(false);
	txtDesc_fabrica.setMaxWidth(60);
	txtDesc_fabrica.setNumberFormat(application.numberformatMontoEn);
	txtDesc_fabrica.getChildControl("upbutton").setVisibility("excluded");
	txtDesc_fabrica.getChildControl("downbutton").setVisibility("excluded");
	txtDesc_fabrica.setSingleStep(0);
	txtDesc_fabrica.setPageStep(0);
	form.add(txtDesc_fabrica, "Desc.fábrica %", null, "desc_fabrica");
	
	var txtComision = new qx.ui.form.Spinner(0, 0, 100);
	txtComision.setMaxWidth(60);
	txtComision.setNumberFormat(application.numberformatMontoEn);
	txtComision.getChildControl("upbutton").setVisibility("excluded");
	txtComision.getChildControl("downbutton").setVisibility("excluded");
	txtComision.setSingleStep(0);
	txtComision.setPageStep(0);
	form.add(txtComision, "Comisión %", null, "comision");
	
	var controllerForm = this.controllerForm = new qx.data.controller.Form(null, form);
	
	var formView = new qx.ui.form.renderer.Single(form);
	this.add(formView, {left: 0, top: 0});
	
	

	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		if (form.validate()) {
			var p = {};
			p.model = qx.util.Serializer.toNativeObject(controllerForm.getModel());
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Parametros");
			rpc.addListener("completed", function(e){
				var data = e.getData();
	
				this.fireDataEvent("aceptado", data.result);
				btnCancelar.execute();
			}, this);
			
			rpc.addListener("failed", function(e){
				var data = e.getData();
				
				if (data.message == "descrip") {
					txtDescrip.setInvalidMessage("Descripción duplicada");
					txtDescrip.setValid(false);
					txtDescrip.focus();
				}
			}, this);
			
			rpc.callAsyncListeners(true, "alta_modifica_fabrica", p);
			
		} else {
			form.getValidationManager().getInvalidFormItems()[0].focus();
		}
	}, this);
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		txtDesc_fabrica.setValid(true);
		txtDescrip.setValid(true);
		
		this.close();
	}, this);
	
	this.add(btnAceptar, {left: "20%", bottom: 0});
	this.add(btnCancelar, {right: "20%", bottom: 0});
	
	},
	members : 
	{
		open : function(rowData)
		{
			var aux;
			
			if (rowData == null) {
				this.setCaption("Nueva fábrica");
		
				aux = qx.data.marshal.Json.createModel({id_fabrica: "0", descrip: "", desc_fabrica: 0, comision: 0}, true);
				
				this.controllerForm.setModel(aux);
				
			} else {
				this.setCaption("Modificar fábrica");
				
				aux = qx.data.marshal.Json.createModel(rowData, true);
				
				this.controllerForm.setModel(aux);
			}
			
			this.show();
			this.setActive(true);
			this.focus();
		}
	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});