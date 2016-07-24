var AppDispatcher = require('../dispatcher/AppDispatcher.js');
var Actions = require('../constants/Actions.js');

var BlogActions = {


	requestMorePosts : function(pageIndex) {
		AppDispatcher.dispatch({
			actionType	: Actions.BLOG.MORE_POSTS_REQUESTED,
			pageIndex	: pageIndex
		});
	},

	submitComment : function(postId, commentComponents) {
		AppDispatcher.dispatch({
			actionType 			: Actions.BLOG.COMMENT_SUBMITTED,
			postId 				: postId,
			commentComponents	: commentComponents
		});
	},

	submitMessage : function(messageComponents) {
		AppDispatcher.dispatch({
			actionType 			: Actions.BLOG.MESSAGE_SUBMITTED,
			messageComponents 	: messageComponents
		});
	}
}

module.exports = BlogActions;
