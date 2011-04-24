#jQTodo

A simple jQTouch application for demonstrating some of the fundamentals of
building web apps for mobile devices. To install it put the whole folder into
your webserver and you should be ready to go.

##Offline mode
To enable offline mode add the manifest attribute to the html tag like this:
```<html manifest="cache.manifest">```

The files listed in the cache.manifest file will now be stored for offline mode.
Once the files are cached it will only use the cache until it finds a change in
the cache.manifest file. Therefore it's important to remember to edit the
revision comment in the manifest every time you have changed something.

Note that you should handle the appCache events to get a full offline mode.
Without them the user has to reload the page twice to get a new version for
example.

For help with debugging the cache manifest add the offline extension:
```<script src="extensions/jqt.offline.js" type="application/x-javascript" charset="utf-8"></script>```

##Change theme
Changing the theme is relatively easy, simply change which theme.css file is
being included from 'apple' to 'jqt'. You also have to change which images are
preloaded in the jqtodo.js file:
```preloadImages: [
'themes/jqt/img/back_button.png',
'themes/jqt/img/back_button_clicked.png',
'themes/jqt/img/whiteButton.png',
'themes/jqt/img/redButton.png']
```

##Device support
Like all jQTouch apps this runs best on iOS based devices but also works on
Android Webkit. On desktop machines it works best in Safari but mostly works
on other Webkit based browsers.