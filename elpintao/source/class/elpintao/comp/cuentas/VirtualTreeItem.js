qx.Class.define("elpintao.comp.cuentas.VirtualTreeItem",
{
  extend : qx.ui.tree.VirtualTreeItem,

  properties :
  {
    chk_visibility :
    {
      check : "String",
      event: "changeChk_visibility",
      init : "visible"
    },
    marcado :
    {
      check : "Boolean",
      event: "changeMarcado",
      nullable : true
    },
    importe :
    {
      check : "String",
      event: "changeImporte",
      nullable : true
    }
  },

  members :
  {
    _addWidgets : function()
    {
      // Here's our indentation and tree-lines
      this.addSpacer();
      this.addOpenButton();

      // The standard tree icon follows
      this.addIcon();
      //this.setIcon("icon/16/places/user-desktop.png");

      // The label
      this.addLabel();

      // All else should be right justified
      this.addWidget(new qx.ui.core.Spacer(), {flex: 1});

      // A checkbox comes right after the tree icon
      var checkbox = new qx.ui.form.CheckBox();
      this.bind("chk_visibility", checkbox, "visibility");
      this.bind("marcado", checkbox, "value");
      this.bind("importe", checkbox, "label");
      checkbox.bind("value", this, "marcado");
      checkbox.setFocusable(false);
      //checkbox.setTriState(true);
      //checkbox.setMarginRight(4);
      this.addWidget(checkbox);
    }
  }
});