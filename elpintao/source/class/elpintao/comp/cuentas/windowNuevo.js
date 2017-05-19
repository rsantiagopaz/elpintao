qx.Class.define("elpintao.comp.cuentas.windowNuevo",
{
	extend : qx.ui.window.Window,
	construct : function (caption, descrip)
	{
		this.base(arguments);
		
		this.set({
			caption: caption,
			width: 320,
			height: 150,
			showMinimize: false,
			showMaximize: false
		});
		
		this.setLayout(new qx.ui.layout.Canvas());
		this.setResizable(false, false, false, false);
		
	
	this.addListenerOnce("appear", function(e){
		txt.focus();
	});
	

	
	this.add(new qx.ui.basic.Label("Descripción: "), {left: 0, top: 2});
	
	var txt = this.txt = new qx.ui.form.TextField(descrip);
	txt.setWidth(200);
	this.add(txt, {left: 70, top: 0});
	

	
	
	var btnAceptar = new qx.ui.form.Button("Aceptar");
	btnAceptar.addListener("execute", function(e){
		this.fireEvent("aceptado");
		btnCancelar.execute();
	}, this);
	this.add(btnAceptar, {left: 70, bottom: 0});
	
	var btnCancelar = new qx.ui.form.Button("Cancelar");
	btnCancelar.addListener("execute", function(e){
		this.close();
		this.destroy();
	}, this);
	this.add(btnCancelar, {left: 190, bottom: 0});  

	
	},
	members : 
	{

	},
	events : 
	{
		"aceptado": "qx.event.type.Event"
	}
});