qx.Class.define("elpintao.comp.pedidos.windowPedExt",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (caption)
	{
		this.base(arguments);
		
		this.set({
			caption: caption,
			width: 410,
			height: 200,
			showMinimize: false,
			showMaximize: false,
			allowMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Basic());
		this.setResizable(false, false, false, false);
		
		
	var application = qx.core.Init.getApplication();
	
	var form = new qx.ui.form.Form();
	
	var txtTelefono = new qx.ui.form.TextField("");
	form.add(txtTelefono, "Teléfono", null, "telefono");

	var txtEmail = new qx.ui.form.TextField("");
	form.add(txtEmail, "E-mail", null, "email");

	var txtDomEntrega = new qx.ui.form.TextField("");
	form.add(txtDomEntrega, "Dom.entrega", null, "domicilio");


	var menuTransporte = new componente.general.ramon.ui.menu.Menu();
	var btnABMTransporte = new qx.ui.menu.Button("ABM transportes...");
	btnABMTransporte.addListener("execute", function(e){
		var win = new elpintao.comp.parametros.windowTransportes();
		win.addListener("disappear", function(e){slbTransporte.focus();});
		win.setModal(true);
		application.getRoot().add(win);
		win.center();
		win.open();	
	});

	menuTransporte.add(btnABMTransporte);
	menuTransporte.memorizar();
	btnABMTransporte.setEnabled(false);
	var slbTransporte = new componente.general.ramon.ui.selectbox.SelectBox();
	slbTransporte.setContextMenu(menuTransporte);

	var controllerTransporte = new qx.data.controller.List(null, slbTransporte, "descrip");
	application.objTransporte.store.bind("model", controllerTransporte, "model");
	
	form.add(slbTransporte, "Transporte", null, "id_transporte")
	
	



	var formView = new qx.ui.form.renderer.Double(form);
	

	this.add(formView, {left: 0, top: 10})
	
	
	var controllerForm = this.controllerForm = new qx.data.controller.Form(null, form);

	controllerForm.addBindingOptions("id_transporte",
		{converter: function(data) {
			return application.objTransporte.indice[data];
		}},
		{converter: function(data) {
			return data.get("id_transporte");
		}}
	);


		
		

	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		this.fireDataEvent("aceptado", qx.util.Serializer.toNativeObject(controllerForm.createModel(true)));
		
		btnCancelar.execute();
	}, this);
	this.add(btnAceptar, {left: 70, top: 130})
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 270, top: 130})
	
	
	this.addListenerOnce("activate", function(e){
		txtTelefono.focus();
	});

	
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});