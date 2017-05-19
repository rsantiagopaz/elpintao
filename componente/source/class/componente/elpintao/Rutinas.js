qx.Class.define("componente.elpintao.Rutinas",
{
	statics:
	{
		calcularImportes: function(obj) {
			obj.plmasiva = obj.precio_lista + (obj.precio_lista * obj.iva / 100);
			
			obj.costo = obj.plmasiva;
			obj.costo = obj.costo - (obj.costo * obj.desc_fabrica / 100);
			obj.costo = obj.costo - (obj.costo * obj.desc_producto / 100);
			
			obj.pcf = obj.costo + (obj.costo * obj.remarc_final / 100);
			obj.pcf = obj.pcf - ((obj.pcf * obj.desc_final) / 100);
			
			obj.pcfcd = obj.pcf - ((obj.pcf * obj.bonif_final) / 100);
			
			obj.utilcf = obj.pcfcd - obj.costo;
			
			obj.pmay = obj.costo + (obj.costo * obj.remarc_mayorista / 100);
			obj.pmay = obj.pmay - ((obj.pmay * obj.desc_mayorista) / 100);
			
			obj.pmaycd = obj.pmay - ((obj.pmay * obj.bonif_mayorista) / 100);
			
			obj.utilmay = obj.pmaycd - obj.costo;
			
			obj.comision = obj.pcfcd * obj.comision_vendedor / 100;
		}
	}

});