 ObjectID = require('mongodb').ObjectID,

module.exports = function(CORE){

	var repo = CORE.repos.mongodb;


	/**
		POSTS
	*/

	var _addPost = function(req){

		var tags = CORE.helpers.utils.removeEmptyStringsArray(
			CORE.helpers.utils.uniqueArray(
				CORE.helpers.utils.splitAndTrim(req.body.tags, ",")
			)
		);

		return repo.insert("posts", {
			headline	: req.body.headline,
			permalink	: req.body.permalink,
			body		: req.body.body,
			tags		: tags,
			created		: Date.now(),
			media		: req.body.media ? req.body.media.split(',').map( function(id){ return ObjectID(id); } ) : [],
			comments	: [],
			status		: "draft"
		});
	};



	var _getPosts = function(){
		return repo.find("posts", {});
	};


	var _deletePost = function(post_id){
		return repo.delete("posts", {_id: ObjectID(post_id) });
	};



	var _getPost = function(post_id) {
		return repo.find("posts",{_id: ObjectID(post_id)});
	}

	var _editPost = function(req, post_id){
		var tags = CORE.helpers.utils.removeEmptyStringsArray(
			CORE.helpers.utils.uniqueArray(
				CORE.helpers.utils.splitAndTrim(req.body.tags, ",")
			)
		);

		return repo.edit("posts", {_id: ObjectID(post_id)}, {
			headline	: req.body.headline,
			permalink	: req.body.permalink,
			body		: req.body.body,
			tags		: tags,
			created		: Date.now(),
			media		: req.body.media ? req.body.media.split(',').map( function(id){ return ObjectID(id); } ) : [],
			comments	: []
		});

	};

	var _editPostStatus = function(post_id, post_status){
		return repo.edit("posts", {_id: ObjectID(post_id)}, {
			status: post_status
		});
	};

	/**
		NOTIFICATIONS
	*/

	var _pushNotification = function(text,type, action){

		return repo.insert("notifications", {
			text: text,
			action: action,
			created: Date.now(),
			dismissed: false,
			type: type || ''
		});
    };

	var _dismissNotification = function(notif_id){
		return repo.edit("notifications", {
			_id: ObjectID(notif_id)
		},{
			dismissed: true
		});
	};

	var _getNotifications = function(include_dismissed){

		return repo.find("notifications",{
			dismissed: (!include_dismissed ? false : undefined )
		});
	};


	/*
		MEDIA
	*/

	var _addMedia = function(files){
		return repo.insert("media",files);
	};


	var _getMedia  = function(query){
		return repo.find("media", query || {});
	};


	var _attachMediaToPost = function(post_id, media_ids){
		return repo.edit( "posts", {_id: ObjectID(post_id)}, {
			media: media_ids.map(function(media_id){
				return ObjectID(media_id);
			})
		});
	};


	var _getTags = function(){
		var flags = {};

		return new Promise(function(resolve, reject){
			repo.find("posts",{}, {
				tags : true
			}).then(function(tag_arrays){

				resolve(CORE.helpers.utils.uniqueArray(
					CORE.helpers.utils.flatArray(
						tag_arrays.map(function(item){return item.tags;	}
					))
				));
			}, reject);
		});


	};


	var _findUsers = function(query){
		return repo.find('users', query);
	}


	return function (req, res, next) {

		req.model = {
			addPost				: _addPost,
			getPosts			: _getPosts,
			deletePost			: _deletePost,
			getPost				: _getPost,
			editPost			: _editPost,
			pushNotification	: _pushNotification,
			dismissNotification	: _dismissNotification,
			getNotifications 	: _getNotifications,
			addMedia 			: _addMedia,
			getMedia			: _getMedia,
			attachMediaToPost	: _attachMediaToPost,
			editPostStatus		: _editPostStatus,
			getTags 			: _getTags,
			findUsers			: _findUsers
		}

		next();
	};
};
