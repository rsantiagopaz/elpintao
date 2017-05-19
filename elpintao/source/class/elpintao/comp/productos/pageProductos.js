qx.Class.define("elpintao.comp.productos.pageProductos",
{
	extend : qx.ui.tabview.Page,
	construct : function (usuario)
	{
	this.base(arguments);

	this.setLabel('Productos');
	this.setLayout(new qx.ui.layout.Grow());
	this.toggleShowCloseButton();
	
	var compositeProductos = this.compositeProductos = new componente.elpintao.ramon.productos.compositeProductos(usuario);
	this.add(compositeProductos);
		
	},
	members : 
	{
		actualizar: function() {
			this.compositeProductos.actualizar();
		}
	}
});