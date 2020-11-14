qx.Class.define("componente.elpintao.ramon.Rutinas",
{
	statics:
	{
		crear_obj_base: function(parametro) {
			var application = qx.core.Init.getApplication();
			
			for (var x in parametro) {
				if (parametro[x] == "objFabrica" && ! application.objFabrica) {
					var objFabrica = application.objFabrica = {};
					objFabrica.store = new qx.data.store.Json();
					objFabrica.store.addListener("loaded", function(e){
						var model = e.getData();
						objFabrica.indice = [];
						for (var i = 0; i < model.length; i++) {
							objFabrica.indice[model.getItem(i).get("id_fabrica")] = model.getItem(i);
							objFabrica.indice[model.getItem(i).get("descrip")] = model.getItem(i);
						}
					});
					objFabrica.store.setUrl("services/class/comp/Stores.php?rutina=leer_fabrica");
					
				} else if (parametro[x] == "objMoneda" && ! application.objMoneda) {
					var objMoneda = application.objMoneda = {};
					objMoneda.store = new qx.data.store.Json();
					objMoneda.store.addListener("loaded", function(e){
						var model = e.getData();
						objMoneda.indice = [];
						for (var i = 0; i < model.length; i++) {
							objMoneda.indice[model.getItem(i).get("id_moneda")] = model.getItem(i);
							objMoneda.indice[model.getItem(i).get("descrip")] = model.getItem(i);
						}
					});
					objMoneda.store.setUrl("services/class/comp/Stores.php?rutina=leer_moneda");
					
				} else if (parametro[x] == "objColor" && ! application.objColor) {
					var objColor = application.objColor = {};
					objColor.store = new qx.data.store.Json();
					objColor.store.addListener("loaded", function(e){
						var model = e.getData();
						objColor.indice = [];
						for (var i = 0; i < model.length; i++) {
							objColor.indice[model.getItem(i).get("id_color")] = model.getItem(i);
							objColor.indice[model.getItem(i).get("descrip")] = model.getItem(i);
						}
					});
					objColor.store.setUrl("services/class/comp/Stores.php?rutina=leer_color");
					
				} else if (parametro[x] == "objUnidad" && ! application.objUnidad) {
					var objUnidad = application.objUnidad = {};
					objUnidad.store = new qx.data.store.Json();
					objUnidad.store.addListener("loaded", function(e){
						var model = e.getData();
						objUnidad.indice = [];
						for (var i = 0; i < model.length; i++) {
							objUnidad.indice[model.getItem(i).get("id_unidad")] = model.getItem(i);
							objUnidad.indice[model.getItem(i).get("descrip")] = model.getItem(i);
						}
					});
					objUnidad.store.setUrl("services/class/comp/Stores.php?rutina=leer_unidad");
					
				}
			}
		}
	}

});