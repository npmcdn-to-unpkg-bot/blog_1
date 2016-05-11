const Events = require('events');
var assign = require('object-assign');
var AppDispatcher = require('../dispatcher/AppDispatcher');

var Actions = require('../constants/Actions.js');
var BlogApi = require('../api/BlogApi.js');

var _event_bus = new Events.EventEmitter();



var BlogStore = function(){


	var	_posts, _media, _prio_tags, _tag_color_map, _settings, _post ;

	var _init = function(){
		//do init
		pageData = pageData || {};

		_posts 		= pageData.posts || [];
		_settings 	= pageData.settings || {};
		_post 		= pageData.post || {};

		pageData.media 								&& _pushMediaArray(pageData.media);
		_settings.tag_prio && pageData.tags			&& _initTags();
		_settings.tag_colors 						&& _initTagColorMap();
	};

	var _pushMediaArray = function(media){
		// map all the media files into media.id, for ease of extraction
		_media = (media || []).reduce(function(acc, crt){
			acc[ crt._id ] = crt;
			return acc;
		},_media || {});
	};



	var _initTags = function(){
		_prio_tags = _settings.tag_prio.split("<|>")
		.reduce(function(acc, crt){
			var components = crt.split("~");

			if (pageData.tags.indexOf(components[0]) != -1 && parseInt(components[1]) > 0 ){
				acc.push({
					name: components[0],
					prio: parseInt(components[1])
				});
			}

			return acc;
		},[])
		.sort(function(a,b){
			if(a.prio < b.prio){
				return -1;
			} else if(a.prio > b.prio) {
				return 1;
			}
			return 0;
		});
	};

	var _initTagColorMap = function(){
		_tag_color_map = _settings.tag_colors.split("<|>").reduce(function(acc, crt){
			var components = crt.split("~");
			acc[components[0]] = (components[1] || '');
			return acc;
		},{});
	}


	var _getHomeContext = function(){
		return {
			media 			: _media,
			tag_color_map 	: _tag_color_map,
			texts : {
				home : {
					tagline : _settings.homepage_tagline
				}
			}
		};
	};


	var _getPostContext = function(){
		return {
			media 			: _media,
			tag_color_map 	: _tag_color_map,
			texts : {
				post : {

				}
			}
		};
	};
	var _getPosts = function(){
		return _posts;
	};

	var _getPost = function(){
		return _post;
	}

	var _getTags = function(){
		return _prio_tags;
	};

	var _addActionCompletedListener = function(callback){
    	_event_bus.on(Actions.BLOG.ACTION_COMPLETED, callback);
	};

	var _removeActionCompletedListener = function(callback){
    	_event_bus.removeListener(Actions.BLOG.ACTION_COMPLETED, callback);
	};


	_init();

	_event_bus.on(Actions.SERVER.MORE_POSTS_PROVIDED, function(response){

		if( response.status == "success" ) {
			_posts = _posts.concat(response.posts);
			_pushMediaArray(response.media);
		}

		_event_bus.emit(Actions.BLOG.ACTION_COMPLETED,Actions.BLOG.MORE_POSTS_REQUESTED, response);
	});


	return {
		getPosts 						: _getPosts,
		getTags 						: _getTags,
		addActionCompletedListener 		: _addActionCompletedListener,
		removeActionCompletedListener 	: _removeActionCompletedListener,
		getPost							: _getPost,

		getHomeContext					: _getHomeContext,
		getPostContext					: _getPostContext
	};



};


AppDispatcher.register(function(action) {

	switch(action.actionType) {

		case Actions.BLOG.MORE_POSTS_REQUESTED:

			BlogApi.getPostsPage(action.pageIndex)
			.then(function(response){
				_event_bus.emit(Actions.SERVER.MORE_POSTS_PROVIDED, response );

			}, function(err){
				console.log('api failed for action', action, err);
				_event_bus.emit(Actions.SERVER.MORE_POSTS_PROVIDED, err);
			});
		break;

		default:
		// no op
	}

});


module.exports = BlogStore;
