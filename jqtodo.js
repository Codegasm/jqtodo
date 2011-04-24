/**
 * The jQTouch main object.
 */
var jQT = $.jQTouch({
	icon: 'icon.png',
	preloadImages: [
		'themes/apple/img/backButton.png',
		'themes/apple/img/whiteButton.png',
		'themes/apple/img/redButton.png',
		'themes/apple/img/pinstripes.png']
});

$(function () {
	jqtodo.initialize();
});

jqtodo = {

	/**
	 * This is where we initialize the application by hooking up some event
	 * handlers. The 'jqtodo_dbReady' event is a custom event that is triggered
	 * by our model once the database is up and running, this way we avoid calling
	 * the model before it can get any data.
	 */
	initialize: function () {
		$(document).bind('jqtodo_dbReady', jqtodo.initMainView);
		$('#form_item_save').bind('click', jqtodo.saveItem);
		$('#addButton').bind('click', jqtodo.newItem);
	},

	/**
	 * This method is called once the model is ready, we simply request all items
	 * from the model and add them to the list on the home page.
	 */
	initMainView: function () {
		jqtodo.model.getAllItems(function (items) {
			$.each(items, function (index, item) {
				jqtodo.initItemView(item);
			});
		});
	},

	/**
	 * This method generates the markup needed for showing an item in the list.
	 * It first checks whether the item is already in the list and if not it
	 * builds a new list entry. The list item displays the content of the todo
	 * item together with a checkbox indicating if it is completed. There are also
	 * buttons hidden in all list items, they are revealed using a swipe motion on
	 * the list item.
	 */
	initItemView: function (item) {
		if ($('item_' + item.id).length === 0) {
			var link = $('<a href="#" class="todoItem">' +
			             '<input type="checkbox" /> <span/></a>'),
			    li = $('<li id="item_' + item.id + '"></li>'),

			    buttonContainer = $('<div class="buttonContainer"></div>'),
			    editButton = $('<a href="#" class="editButton whiteButton">Edit</a>'),
			    deleteButton = $('<a href="#" class="deleteButton redButton">Delete</a> '),
			    cancelButton = $('<a href="#" class="cancelButton whiteButton">Cancel</a>');

			// Toggle the comments on the two following lines to access the buttons from
			// a computer. That way clicking an item reveals the buttons.
			//$(link).bind('click', {'id': item.id}, jqtodo.showItemButtons);
			$(link).bind('click', {'id': item.id}, jqtodo.toggleCheckbox);
			$(link).find(':checkbox').change({'id': item.id}, jqtodo.toggleItem);
			$(link).find(':checkbox').click(function (event) {event.stopPropagation(); });

			$(link).bind('swipe', {'id': item.id}, jqtodo.showItemButtons);
			$(editButton).bind('click', {'id': item.id}, jqtodo.editItem);
			$(editButton).bind('click', {'id': item.id}, jqtodo.hideItemButtons);
			$(deleteButton).bind('click', {'id': item.id}, jqtodo.deleteItem);
			$(cancelButton).bind('click', {'id': item.id}, jqtodo.hideItemButtons);

			$(li).append($(link));

			$(buttonContainer).append($(editButton));
			$(buttonContainer).append($(deleteButton));
			$(buttonContainer).append($(cancelButton));
			$(li).append($(buttonContainer).hide());
			
			$('#todo_items').prepend($(li));
		}

		jqtodo.updateItemView(item);
	},

	/**
	 * This method actually gives the list item it's content. By separating the
	 * code for building the markup and the code for applying the state we can
	 * update a list item without rebuilding the markup.
	 */
	updateItemView: function (item) {
		$('#item_' + item.id).find('.todoItem > span').text(item.content);
		$('#item_' + item.id).find(':checkbox').attr('checked', item.completed);

		if (item.completed == 1) {
			$('#item_' + item.id).addClass('completedItem');
		}
	},

	/**
	 * This method simulates clicking the checkbox when the user presses on a
	 * list item. This is mainly done because checkboxes are bit hard to hit on
	 * mobile devices.
	 */
	toggleCheckbox: function () {
		$(this).removeClass('active');
		$(this).find(':checkbox').click();
		return false;
	},

	/**
	 * This is where we actually handle a change in the checkbox state of a list
	 * item. Two things are done, we update the CSS of the list item and we use
	 * the model to update the database entry for this item.
	 */
	toggleItem: function (event) {
		if ($(this).attr('checked')) {
			$('#item_' + event.data.id).addClass('completedItem');
		} else {
			$('#item_' + event.data.id).removeClass('completedItem');
		}

		jqtodo.model.setItemCompletion(event.data.id, $(this).attr('checked') ? 1 : 0);
	},

	/**
	 * This is the event handler for the click event on the add button in the
	 * toolbar. All it does is clear the form and then navigate to the form page.
	 */
	newItem: function () {
		$('#form_item_content').val('');
		$('#form_item_id').val(0);

		jQT.goTo('#item_form', 'slideup');
	},

	/**
	 * This is the event handler for the click event on the 'Save' button of the
	 * form. If the #form_item_id hidden input has a value we know that this is
	 * an edit, otherwise we are creating a new item. All the work is done by
	 * the model we simply call the right method depending on what we are doing.
	 *
	 * Both createItem and setItemContent on the model use a callback as their
	 * second argument. The callback is called with the new or edited item, this
	 * way we can get the new data and insert it into the view. The reason we are
	 * using callbacks for this is that the model uses WebSQL which is entirely
	 * asynchronous so there would be no way to return the new item directly.
	 */
	saveItem: function () {
		var itemId = $('#form_item_id').val();

		if (itemId === '0') {
			jqtodo.model.createItem($('#form_item_content').val(),
				function (item) {
					jqtodo.initItemView(item);
				});
		} else {
			jqtodo.model.setItemContent(itemId, $('#form_item_content').val(),
				function (item) {
					jqtodo.updateItemView(item);
				});
		}

		jQT.goTo('#home');
	},

	/**
	 * This is the event handler for the swipe event on a list item, it simply
	 * reveals the buttons for this item
	 */
	showItemButtons: function (event) {
		$('#item_' + event.data.id + ' > .todoItem').hide();
		$('#item_' + event.data.id + ' > .buttonContainer').fadeIn();
	},

	/**
	 * This is the event handler for the click event on the cancel button and
	 * the edit button, it simply hides the buttons for this item.
	 */
	hideItemButtons: function (event) {
		$('#item_' + event.data.id + ' > .buttonContainer').hide();
		$('#item_' + event.data.id + ' > .todoItem').show();
	},

	/**
	 * This is the event handle for the click event on the edit button for an
	 * item. It requests the item from the model and displays it's content in the
	 * form before navigating to the form. It also sets the #form_item_id hidden
	 * input which is used to determin if the form is being used for editing.
	 *
	 * Again we are using a callback in getItem due to the asynchronous nature
	 * of our model.
	 */
	editItem: function (event) {
		jqtodo.model.getItem(event.data.id, function (item) {
			$('#form_item_content').html(item.content);
			$('#form_item_id').val(event.data.id);

			jQT.goTo('#item_form');
		});
	},

	/**
	 * This is the event handler for the click event on the 'Delete' button of a
	 * list item. Nothing interesting here, the model takes care of it all.
	 */
	deleteItem: function (event) {
		$('#item_' + event.data.id).slideUp();

		jqtodo.model.deleteItem(event.data.id);
	}
	
};