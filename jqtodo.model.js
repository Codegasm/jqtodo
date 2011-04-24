
$(function () {
	jqtodo.model.initializeDatabase();
});

jqtodo.model = {

	/**
	 * Our database handle.
	 */
	db: null,

	/**
	 * Prepares the Web SQL database for operation. We request a database of 1 MB
	 * because lets face it, how much space can a few todo items take. Next we
	 * will create the table we use in case it isn't already created.
	 *
	 * The commented line is useful if you want to rebuild the structure or simply
	 * clear all data. Uncomment it and reload the application and then comment
	 * it again.
	 */
	initializeDatabase: function () {
		var dbSize = 1024 * 1024; // 1 MB
		jqtodo.model.db = openDatabase('jqtodo', '1.0', '', dbSize);
		
		jqtodo.model.db.transaction(function (tx) {
			//tx.executeSql('DROP TABLE todo_items;', null, null, jqtodo.model.dbError);
			tx.executeSql(
				'CREATE TABLE IF NOT EXISTS todo_items (' +
					'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
					'content TEXT, ' +
					'completed TINYINT' +
					');',
				null, 
				null,
				jqtodo.model.dbError
			);
		}, jqtodo.model.dbError, function () {
			$(document).trigger('jqtodo_dbReady');
		});
	},

	/**
	 * Our create method has a somewhat deep structure that makes it a bit hard
	 * to read but it's not very complicated. First comes the transaction where we
	 * execute our INSERT statement. In the success callback of that statement we
	 * have our SELECT statement to retreive the newly created item. In the
	 * success callback of the SELECT statement we will call our own callback
	 * with the new item.
	 */
	createItem: function (content, callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('INSERT INTO todo_items (id, content, completed) ' + 
				'VALUES (null, ?, 0);', [content], function () {
					tx.executeSql('SELECT last_insert_rowid() as id FROM todo_items;', 
						[],
						function (tx, result) {
							jqtodo.model.getItem(result.rows.item(0).id, function (item) {
								if (typeof (callback) !== 'undefined') {
									callback(item);
								}
							});
						}, jqtodo.model.dbError);
				}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * This simply selects all items and puts them in an array. The array is then
	 * returned via the callback.
	 */
	getAllItems: function (callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM todo_items;', null, function (tx, result) {
				var items = [], i;
				
				for (i = 0; i < result.rows.length; i += 1) {
					items.push(result.rows.item(i));
				}
				
				if (typeof (callback) !== 'undefined') {
					callback(items);
				}
			}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * Selects one item from the database and returns it via the callback.
	 */
	getItem: function (id, callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM todo_items WHERE id=?;', [id], 
				function (tx, result) {
					if (typeof (callback) !== 'undefined' && result.rows.length > 0) {
						callback(result.rows.item(0));
					}
				}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * Updates the completion status of an item. For the sake of simplicity we
	 * don't return the item in the callback since we don't need it but a more
	 * complex model would probably have a unified update method which does
	 * return the item after being edited.
	 */
	setItemCompletion: function (id, completed, callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('UPDATE todo_items SET completed=? WHERE id=?;', 
					[completed, id], function () {
					if (typeof (callback) !== 'undefined') {
						callback();
					}
				}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * Updates the content text of the item. In the success callback of our UPDATE
	 * statement we get the updated item from the database and return it via
	 * the callback.
	 */
	setItemContent: function (id, content, callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('UPDATE todo_items SET content=? WHERE id=?;', 
					[content, id], function () {
					jqtodo.model.getItem(id, function (item) {
						if (typeof (callback) !== 'undefined') {
							callback(item);
						}
					});
				}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * Deletes an item from the database and calls our callback once it is done.
	 */
	deleteItem: function (id, callback) {
		jqtodo.model.db.transaction(function (tx) {
			tx.executeSql('DELETE FROM todo_items WHERE id=?;', 
					[id], function () {
					if (typeof (callback) !== 'undefined') {
						callback();
					}
				}, jqtodo.model.dbError);
		}, jqtodo.model.dbError);
	},

	/**
	 * This our error displaying method. It simply sends the message out to the
	 * console if the browser supports console.log. In a real world application
	 * you would probably have to handle errors instead of just displaying them.
	 */
	dbError: function (tx, exception) {
		if (typeof console !== "undefined" && exception) {
			console.log(exception.message);
		}
	}

};