qx.Class.define("elpintao.comp.varios.windowAcercaDe",
{
	extend : qx.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);

		this.set({
			caption: "Acerca de...",
			width: 400,
			height: 400,
			showMinimize: false,
			showMaximize: false
		});
		this.setLayout(new qx.ui.layout.Basic());

		//this.add(new qx.ui.basic.Label("Abril de 2010"), {left: 20, top: 20});
	},
	members : 
	{

	}
});