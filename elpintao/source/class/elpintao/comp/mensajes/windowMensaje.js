qx.Class.define("elpintao.comp.mensajes.windowMensaje",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function (model)
	{
		this.base(arguments);
		
		this.set({
			caption: "Mensaje",
			width: 710,
			height: 470,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		//this.setResizable(false, false, false, false);
		
	this.addListenerOnce("appear", function(e){

	});
	
	

	var commandEscape = new qx.ui.command.Command("Escape");
	commandEscape.addListener("execute", function(e){
		this.close();
	}, this);
	this.registrarCommand(commandEscape);
	commandEscape.setEnabled(false);

		
		
	var form = new qx.ui.form.Form();
	
	var txtFecha = new qx.ui.form.TextField("");
	txtFecha.setReadOnly(true);
	form.add(txtFecha, "Fecha", null, "fecha");
	
	var txtSucursal = new qx.ui.form.TextField("");
	txtSucursal.setReadOnly(true);
	form.add(txtSucursal, "Sucursal", null, "sucursal");
	
	var txtUsuario_de = new qx.ui.form.TextField("");
	txtUsuario_de.setReadOnly(true);
	form.add(txtUsuario_de, "De", null, "usuario_de");
	
	var txtUsuario_para = new qx.ui.form.TextField("");
	txtUsuario_para.setReadOnly(true);
	form.add(txtUsuario_para, "Para", null, "usuario_para");
	
	var txtAsunto = new qx.ui.form.TextField("");
	txtAsunto.setReadOnly(true);
	form.add(txtAsunto, "Asunto", null, "asunto");
	
	
	var formView = new qx.ui.form.renderer.Double(form);
	
	this.add(formView, {left: 0, top: 0})
	
	//var lblMensaje = new qx.ui.basic.Label(model.get("mensaje"));
	//lblMensaje.setRich(true);
	//this.add(lblMensaje, {left: 0, top: 150});
	
	var richWidget = new qx.ui.embed.Html(model.get("mensaje"));
	richWidget.setOverflow("auto", "auto");
	richWidget.setDecorator("main");
	richWidget.setBackgroundColor("white");
	this.add(richWidget, {left: 0, top: 110, right: 0, bottom: 0});
	//modelForm = qx.data.marshal.Json.createModel(model);
	
	
	var controllerForm = new qx.data.controller.Form(model, form);
	
		
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});