qx.Class.define("elpintao.comp.remitos.windowAutorizaRemito",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (rowRemito, emitir)
	{
	this.base(arguments);
	
	this.set({
		width: 370,
		height: 150,
		showMinimize: false,
		showMaximize: false
	});
	
	if (emitir) {
		this.setCaption("Entregar mercaderia");
	} else {
		this.setCaption("Ingresar mercaderia");
	}
	
	this.setLayout(new qx.ui.layout.Canvas());
	this.setResizable(false, false, false, false);
	
	this.addListenerOnce("appear", function(e){
		cboAutoriza.focus();
	});
	
	var application = qx.core.Init.getApplication();
	var id_remito = ((emitir) ? rowRemito.id_remito_emi : rowRemito.id_remito_rec);
	var contexto = this;
	
	var form = new qx.ui.form.Form();
	
	
	var cboAutoriza = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Remitos", "autocompletarUsuario", null, 1);
	cboAutoriza.setRequired(true);
	form.add(cboAutoriza, "Autoriza", null, "cboAutoriza");
	var lstAutoriza = cboAutoriza.getChildControl("list");
	
	
	var txtAutorizaClave = new qx.ui.form.PasswordField("");
	txtAutorizaClave.setRequired(true);
	txtAutorizaClave.addListener("blur", function(e){
		txtAutorizaClave.setValue(txtAutorizaClave.getValue().trim());
	});
	form.add(txtAutorizaClave, "Contraseña", null, "autoriza_pass");
	

	var cboTransporta = new componente.general.ramon.ui.combobox.ComboBoxAuto("services/", "comp.Remitos", "autocompletarUsuario", null, 1);
	cboTransporta.setRequired(! emitir && rowRemito.id_usuario_transporta > "0");
	form.add(cboTransporta, "Transporta", null, "cboTransporta");
	var lstTransporta = cboTransporta.getChildControl("list");

	
	var txtTransportaClave = new qx.ui.form.PasswordField("");
	txtTransportaClave.setRequired(! emitir && rowRemito.id_usuario_transporta > "0");
	txtTransportaClave.addListener("blur", function(e){
		txtTransportaClave.setValue(txtTransportaClave.getValue().trim());
	});
	form.add(txtTransportaClave, "Contraseña", null, "transporta_pass");
	
	var formView = new qx.ui.form.renderer.Double(form);
	
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
			p.id_remito = id_remito;
			p.id_usuario_transporta = rowRemito.id_usuario_transporta;
			p.model = qx.util.Serializer.toNativeObject(modelForm);
			p.model.autoriza = lstAutoriza.getSelection()[0].getModel();
			if (!lstTransporta.isSelectionEmpty()) p.model.transporta = lstTransporta.getSelection()[0].getModel();

			var rpc = new componente.general.ramon.io.rpc.Rpc("services/", "comp.Remitos");
			rpc.setTimeout(60000 * 1);
			rpc.callAsync(function(resultado, error, id) {
				if (resultado.error.length > 0) {
					for (var x in resultado.error) {
						if (resultado.error[x].descrip == "autorizado") {
							dialog.Dialog.error(resultado.error[x].message, function(e){contexto.fireDataEvent("actualizar", id_remito); btnCancelar.execute();});
						}
						if (resultado.error[x].descrip == "autoriza") {
							cboAutoriza.setInvalidMessage(resultado.error[x].message);
							txtAutorizaClave.setInvalidMessage(resultado.error[x].message);
							cboAutoriza.setValid(false);
							txtAutorizaClave.setValid(false);
							cboAutoriza.focus();
							cboAutoriza.selectAllText();
						}
						if (resultado.error[x].descrip == "transporta") {
							cboTransporta.setInvalidMessage(resultado.error[x].message);
							txtTransportaClave.setInvalidMessage(resultado.error[x].message);
							cboTransporta.setValid(false);
							txtTransportaClave.setValid(false);
							cboTransporta.focus();
							cboTransporta.selectAllText();
						}
					}
					asyncValidator.setValid(false);
				} else {
					asyncValidator.setValid(true);
				}
			}, ((emitir) ? "autorizar_remito_emi" : "autorizar_remito_rec"), p);
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
			//application.functionTransmitir();
			this.fireDataEvent("aceptado", id_remito);
			btnCancelar.execute();
		}
	}, this);
	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		cboAutoriza.setValid(true);
		txtAutorizaClave.setValid(true);
		cboTransporta.setValid(true);
		txtTransportaClave.setValid(true);
		
		form.validate();
	}, this);
	this.add(btnAceptar, {left: 70, bottom: 0})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 220, bottom: 0})
	
	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event",
		"actualizar": "qx.event.type.Event"
	}
});