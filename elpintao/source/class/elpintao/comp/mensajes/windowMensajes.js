qx.Class.define("elpintao.comp.mensajes.windowMensajes",
{
	extend : componente.general.ramon.ui.window.Window,
	construct : function ()
	{
		this.base(arguments);
		
		this.set({
			caption: "Mensajes",
			width: 400,
			showMinimize: false,
			showMaximize: false
		});
		
	this.addListenerOnce("appear", function(e){
		list.focus();
	}, this);
		
  this.setLayout(new qx.ui.layout.Grow());
  this.setResizable(false, false, false, false);
  
  
  var application = qx.core.Init.getApplication();
  


  var commandEscape = new qx.ui.command.Command("Escape");
  commandEscape.addListener("execute", function(e){
  	this.hide();
  }, this);
  this.registrarCommand(commandEscape);
  commandEscape.setEnabled(false);



  

	var commandVerMensaje = new qx.ui.command.Command("Enter");
	commandVerMensaje.setEnabled(false);
	commandVerMensaje.addListener("execute", function(e) {
		var win = new elpintao.comp.mensajes.windowMensaje(list.getModelSelection().getItem(0).get("json"));
		win.addListener("close", function(e){
			win.destroy();
			this.activate();
		}, this);
		application.getRoot().add(win, {left: application.getRoot().getBounds().width - win.getWidth(), top: "7%"});
		win.open();
	}, this);
	
	var menu = new componente.general.ramon.ui.menu.Menu();
	
	var btnVerMensaje = new qx.ui.menu.Button("Ver mensaje...", null, commandVerMensaje); 
	
	
	var btnEliminar = new qx.ui.menu.Button("Eliminar mensaje");
	btnEliminar.setEnabled(false);
	btnEliminar.addListener("execute", function(e){
		dialog.Dialog.confirm("Desea eliminar el mensaje seleccionado?", function(e){
			if (e) {
				var p = {id_mensaje: list.getModelSelection().getItem(0).get("id_mensaje")};

				var rpc = new qx.io.remote.Rpc(application.conexion.rpc_elpintao_services, "componente.elpintao.ramon.Productos");
				try {
					var resultado = rpc.callSync("eliminar_mensaje", p);
				} catch (ex) {
					alert("Sync exception: " + ex);
				}
				
				store.reload();
			}
		});
	});
	menu.add(btnVerMensaje);
	menu.addSeparator();
	menu.add(btnEliminar);
	menu.memorizar();
  
  
  
  // create and add the list
  var list = this.list = new componente.general.ramon.ui.list.List();
  list.setSelectionMode("one");
  list.setContextMenu(menu);
  list.addListener("changeSelection", function(e){
  	var bool = !list.isSelectionEmpty();
  	//commandVerMensaje.setEnabled(bool);
  	//menu.memorizar([commandVerMensaje]);
  	menu.memorizarEnabled([commandVerMensaje, btnEliminar], bool);
  });
  list.addListener("dblclick", function(e){
	commandVerMensaje.execute();
  });
  this.add(list);

  // create the controller
  var controller = new qx.data.controller.List(null, list);
  // set the delegate
  controller.setDelegate({configureItem: function(item) {
	item.setRich(true);
	//item.getChildControl("icon").setWidth(48);
	//item.getChildControl("icon").setHeight(48);
	//item.getChildControl("label").setHeight(48);
	//item.getChildControl("icon").setScale(true);
  }});

  // set the name for the label property
  controller.setLabelPath("descrip");


  // fetch some data from Twitter
  var url = application.conexion.rpc_elpintao_services + "class/componente/elpintao/ramon/Stores.php?rutina=leer_mensaje";
  var store = new qx.data.store.Json();
  store.addListener("loaded", function(e){
  	var data = e.getData();
  	if (data.getLength() > 0) {
  		application.btnMensajes.setLabel("Usuario: " + application.usuario.nick + " (" + data.getLength() + ")");
	  	if (data.getItem(0).get("mostrar")) {
			if (this.isVisible()) {
				this.getLayoutParent().getWindowManager().bringToFront(this);
			} else {
				var root = application.getRoot();
				root.add(this, {left: root.getBounds().width - this.getWidth(), top: "7%", height: "90%"});
				this.open();
			}
	  	}
  	} else application.btnMensajes.setLabel("Mensajes");
  	
  	list.setSelectionMode("single");
  	list.setSelectionMode("one");
  }, this);

  // connect the store and the controller
  
  
  
  
	var timerTransmision = new qx.event.Timer(30000);
	//var timerTransmision = this.timerTransmision = new qx.event.Timer(10000);
	timerTransmision.addListener("interval", function(e){
		store.reload();
	});
	timerTransmision.start();
	
	store.bind("model", controller, "model");
	store.setUrl(url);
  
  
  },

  members : {

  }
});
