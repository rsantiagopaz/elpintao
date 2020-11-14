qx.Class.define("elpintao.comp.varios.windowLogin",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
	this.base(arguments);
	
	this.set({
		caption: "Ingrese datos de identificación",
		width: 260,
		height: 135,
		showMinimize: false,
		showMaximize: false,
		allowClose: false,
		allowMaximize: false
	});
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		cboAutoriza.focus();
	});
	
	var application = qx.core.Init.getApplication();
	
	var usuario;
	
	
	var form = new qx.ui.form.Form();
	
	
	var cboAutoriza = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Inicial", "autocompletarUsuario", null, 1);
	cboAutoriza.setWidth(150);
	cboAutoriza.setRequired(true);
	form.add(cboAutoriza, "Usuario", null, "cboAutoriza");
	var lstAutoriza = cboAutoriza.getChildControl("list");
	
	
	var txtAutorizaClave = new qx.ui.form.PasswordField("");
	txtAutorizaClave.setRequired(true);
	txtAutorizaClave.addListener("blur", function(e){
		txtAutorizaClave.setValue(txtAutorizaClave.getValue().trim());
	});
	form.add(txtAutorizaClave, "Contraseña", null, "autoriza_pass");
	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		cboAutoriza.setValid(true);
		txtAutorizaClave.setValid(true);
		
		form.validate();
	}, this);
	form.addButton(btnAceptar);
	//this.add(btnAceptar, {left: 80, bottom: 0})
	
	
	var formView = new qx.ui.form.renderer.Single(form);
	
	this.add(formView, {left: 0, top: 0});
	
	var controllerForm = new qx.data.controller.Form(null, form);
	var modelForm = controllerForm.createModel(true);
	

	
	var validationManager = form.getValidationManager();
	validationManager.setValidator(new qx.ui.form.validation.AsyncValidator(function(items, asyncValidator){
		var bool = true;
		for (var x in items) {
			bool = bool && items[x].isValid();
		}
		if (bool) {
			var p = {};
			p.id_usuario = lstAutoriza.getSelection()[0].getUserData("datos").id_usuario;
			p.password = txtAutorizaClave.getValue();
			
			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Inicial");
			rpc.addListener("completed", function(e){
				var data = e.getData();
				
				usuario = data.result;
				
				asyncValidator.setValid(true);
			});
			rpc.addListener("failed", function(e){
				var data = e.getData();
				
				if (data.message == "password") {
					txtAutorizaClave.setInvalidMessage("Contraseña incorrecta");
					txtAutorizaClave.setValid(false);
					txtAutorizaClave.focus();
					txtAutorizaClave.selectAllText();
				}
				
				asyncValidator.setValid(false);
			});

			rpc.callAsyncListeners(true, "leer_usuario", p);

		} else {
			for (var x in items) {
				if (!items[x].isValid()) {
					items[x].focus();
					break;
				}
			}
		}
	}));
	
	
	validationManager.addListener("complete", function(e){
		if (validationManager.getValid()) {
			
			this.fireDataEvent("aceptado", usuario);
			
			this.destroy();
		}
	}, this);
	
	

	
	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});