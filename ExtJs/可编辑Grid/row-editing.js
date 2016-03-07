Ext.Loader.setConfig({
	enabled: true
});

Ext.Loader.setPath('Ext.ux', '../ExtJs/ext-4.2.1.883/examples/ux');
Ext.require([
	'Ext.grid.*',
	'Ext.data.*',
	'Ext.util.*',
	'Ext.state.*',
	'Ext.form.*',
	'Ext.toolbar.Paging',
	'Ext.ux.PreviewPlugin',
	'Ext.ModelManager',
	'Ext.tip.QuickTipManager'
]);

Ext.onReady(function() {
	Ext.tip.QuickTipManager.init();
	// Define our data model
	Ext.define('Employee', {
		extend: 'Ext.data.Model',
		fields: [
			'name',
			'email', {
				name: 'start',
				type: 'date',
				dateFormat: 'n/j/Y'
			}, {
				name: 'salary',
				type: 'float'
			}, {
				name: 'active',
				type: 'bool'
			}
		]
	});

	// Generate mock employee data
	var data = (function() {
		var lasts = ['Jones', 'Smith', 'Lee', 'Wilson', 'Black', 'Williams', 'Lewis', 'Johnson', 'Foot', 'Little', 'Vee', 'Train', 'Hot', 'Mutt'],
			firsts = ['Fred', 'Julie', 'Bill', 'Ted', 'Jack', 'John', 'Mark', 'Mike', 'Chris', 'Bob', 'Travis', 'Kelly', 'Sara'],
			lastLen = lasts.length,
			firstLen = firsts.length,
			usedNames = {},
			data = [],
			s = new Date(2007, 0, 1),
			eDate = Ext.Date,
			now = new Date(),
			getRandomInt = Ext.Number.randomInt,

			generateName = function() {
				var name = firsts[getRandomInt(0, firstLen - 1)] + ' ' + lasts[getRandomInt(0, lastLen - 1)];
				if (usedNames[name]) {
					return generateName();
				}
				usedNames[name] = true;
				return name;
			};

		while (s.getTime() < now.getTime()) {
			var ecount = getRandomInt(0, 3);
			for (var i = 0; i < ecount; i++) {
				var name = generateName();
				data.push({
					start: eDate.add(eDate.clearTime(s, true), eDate.DAY, getRandomInt(0, 27)),
					name: name,
					email: name.toLowerCase().replace(' ', '.') + '@sencha-test.com',
					active: getRandomInt(0, 1),
					salary: Math.floor(getRandomInt(35000, 85000) / 1000) * 1000
				});
			}
			s = eDate.add(s, eDate.MONTH, 1);
		}

		return data;
	})();

	// create the Data Store
	var store = Ext.create('Ext.data.Store', {
		// destroy the store if the grid is destroyed
		autoDestroy: true,
		model: 'Employee',
		proxy: {
			type: 'memory'
		},
		data: data,
		sorters: [{
			property: 'start',
			direction: 'ASC'
		}]
	});

	var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
		clicksToMoveEditor: 1,
		autoCancel: false
	});
	var bt_first = new Ext.Toolbar.Button({
		tooltip: "第一页",
		overflowText: "第一页",
		iconCls: 'x-tbar-page-first',
		disabled: false,
		enable: true,
		handler: do_first
	});


	var bt_prev = new Ext.Toolbar.Button({
		tooltip: "前一页",
		overflowText: "前一页",
		iconCls: 'x-tbar-page-prev',
		disabled: false,
		enable: true,
		handler: do_prev
	});
	var bt_number = new Ext.form.NumberField({
		cls: 'x-tbar-page-number',
		allowDecimals: false,
		allowNegative: false,
		enableKeyEvents: true,
		selectOnFocus: true,
		submitValue: false,
		listeners: {
			keydown: onPagingKeyDown
		}
	});
	bt_number.setValue(curPageNum);


	var bt_next = new Ext.Toolbar.Button({
		tooltip: "下一页",
		overflowText: "下一页",
		iconCls: 'x-tbar-page-next',
		disabled: false,
		enable: true,
		handler: do_next
	});


	var bt_last = new Ext.Toolbar.Button({
		tooltip: "最后页",
		overflowText: "最后页",
		iconCls: 'x-tbar-page-last',
		disabled: false,
		enable: true,
		handler: do_last
	});


	var bt_refresh = new Ext.Toolbar.Button({
		tooltip: "刷新",
		overflowText: "刷新",
		iconCls: 'x-tbar-loading',
		disabled: false,
		enable: true,
		handler: do_refresh
	});


	var lb_num = new Ext.form.Label({
		text: '0'
	});


	function do_first() {
		start = 0;
		log_search();
		curPageNum = 1;
		bt_number.setValue(curPageNum);
	}


	function do_next() {
		start = start + limit;
		log_search();
		curPageNum = curPageNum + 1;
		bt_number.setValue(curPageNum);
	}


	function do_last() {
		start = (maxPageCount - 1) * pagesize;
		log_search();
		curPageNum = maxPageCount;
		bt_number.setValue(curPageNum);
	}


	function do_prev() {
		start = start - pagesize;
		log_search();
		curPageNum = curPageNum - 1;
		bt_number.setValue(curPageNum);
	}

	function onPagingKeyDown(txtfield, e) {
		if (e.getKey() == Ext.EventObject.ENTER) {
			if (bt_number.getValue() != "") {
				start = (parseInt(bt_number.getValue()) - 1) * pagesize;
				log_search();
			} else
				alert(bt_number.getValue());


		}
	}

	function do_refresh() {
		log_search();
	}
	var m_toolbar = new Ext.Toolbar({
		items: [bt_first, bt_prev, '-', '第', bt_number, '页', '共', lb_num,
			'页', '-', bt_next, bt_last, bt_refresh
		]
	});
	var pluginExpanded = true;
	// create the grid and specify what field you want
	// to use for the editor at each column.
	var grid = Ext.create('Ext.grid.Panel', {
		store: store,
		columns: [{
			header: 'Name',
			dataIndex: 'name',
			flex: 1,
			editor: {
				// defaults to textfield if no xtype is supplied
				allowBlank: false
			}
		}, {
			header: 'Email',
			dataIndex: 'email',
			width: 160,
			editor: {
				allowBlank: false,
				vtype: 'email'
			}
		}, {
			xtype: 'datecolumn',
			header: 'Start Date',
			dataIndex: 'start',
			width: 105,
			editor: {
				xtype: 'datefield',
				allowBlank: false,
				format: 'm/d/Y',
				minValue: '01/01/2006',
				minText: 'Cannot have a start date before the company existed!',
				maxValue: Ext.Date.format(new Date(), 'm/d/Y')
			}
		}, {
			xtype: 'numbercolumn',
			header: 'Salary',
			dataIndex: 'salary',
			format: '$0,0',
			width: 90,
			editor: {
				xtype: 'numberfield',
				allowBlank: false,
				minValue: 1,
				maxValue: 150000
			}
		}, {
			xtype: 'checkcolumn',
			header: 'Active?',
			dataIndex: 'active',
			width: 60,
			editor: {
				xtype: 'checkbox',
				cls: 'x-grid-checkheader-editor'
			}
		}],
		renderTo: 'editor-grid',
		width: 600,
		height: 400,
		title: 'Employee Salaries',
		frame: true,
		tbar: [{
			text: 'Add Employee',
			iconCls: 'employee-add',
			handler: function() {
				rowEditing.cancelEdit();

				// Create a model instance
				var r = Ext.create('Employee', {
					name: 'New Guy',
					email: 'new@sencha-test.com',
					start: Ext.Date.clearTime(new Date()),
					salary: 50000,
					active: true
				});

				store.insert(0, r);
				rowEditing.startEdit(0, 0);
			}
		}, {
			itemId: 'removeEmployee',
			text: 'Remove Employee',
			iconCls: 'employee-remove',
			handler: function() {
				var sm = grid.getSelectionModel();
				rowEditing.cancelEdit();
				store.remove(sm.getSelection());
				if (store.getCount() > 0) {
					sm.select(0);
				}
			},
			disabled: true
		}],
		plugins: [rowEditing],
		listeners: {
			'selectionchange': function(view, records) {
				grid.down('#removeEmployee').setDisabled(!records.length);
			}
		},
		bbar: Ext.create('Ext.Toolbar.Button', {
				tooltip: "第一页",
				overflowText: "第一页",
				iconCls: 'x-tbar-page-first',
				disabled: false,
				enable: true,
				handler: do_first
			})
			/*,
			bbar: Ext.create('Ext.PagingToolbar', {
				store: store,
				displayInfo: true,
				displayMsg: 'Displaying topics {0} - {1} of {2}',
				emptyMsg: "No topics to display",

				items: [
					'-', {
						text: 'Show Preview',
						pressed: pluginExpanded,
						enableToggle: true,
						toggleHandler: function(btn, pressed) {
							var preview = Ext.getCmp('gv'); //.getPlugin('preview');
							//preview.toggleExpanded(pressed);
							alert("123");
						}
					}, '+', {
						text: 'Show Preview',
						//pressed: pluginExpanded,
						enableToggle: true,
						toggleHandler: function(btn, pressed) {
							//var preview = Ext.getCmp('gv'); //.getPlugin('preview');
							//preview.toggleExpanded(pressed);
							alert("123");
						}
					}
				]

			}),
			*/
	});
});