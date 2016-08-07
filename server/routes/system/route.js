var ObjectID = require('mongodb').ObjectID;
var ShortId  =  require('shortid');

module.exports = [
	/**
	*	Admin POST "Async File upload".
	*/

	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["admin"]
		},
		method: "POST",
		path: "/system/async_file_upload/",
		handler: function(req, res){

			req.media.processMediaFiles( req.files )

			.then(function(file_arrays){

				req.model.addMedia(  file_arrays.valid )
				.then(function(insert_report) {

					res.send( req.interface.render('upload_report', file_arrays));
				})
			})

			.catch( function(err){
				res.send( req.interface.to("default").render("500",  {err_object: arguments}) );
			});

		},
		access_violation : function(req, res){
			res.send( req.interface.to("default").render("403") );
		}

	},

	/**
	*	JSON GET "Media Files".
	*/
	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["admin", "web"]
		},
		method: "GET",
		path: "/system/get_media_files",

		handler : function(req, res){

			req.model.getMedia()
			.then(function(media_files){
				res.send( JSON.stringify( media_files ) );
			}).catch(function(error){

				res.send( JSON.stringify({
					status: "error",
					message: "something happened when retreiving media files",
					error: json.stringify(error)
				}));
			});

		},
		access_violation : function(req, res){
			res.send( JSON.stringify({
				status: "error",
				message: "Access violation"
			}));
		}
	},


	/*GET A PAGE OF POSTS*/
	{
		access: {
			sockets: ["ADMIN", "REGISTERED", "PUBLIC"],
			interfaces: ["json", "admin", "web"]
		},
		method: "GET",
		path: "/system/get_blog_page",
		handler: function(req,res){
    		res.setHeader('Content-Type', 'application/json');

			var page_index = parseInt(req.query.pageIndex) || 0;

			//include the tag in the query object if this is present in the parameters
			var query_obj = {};
			if( typeof req.query.tag !== "undefined") {
				query_obj = {
					tags: req.query.tag
				}
			}

			req.model.getPosts(query_obj,{
				limit: req.model.getSettingsCache().page_size,
				skip: req.model.getSettingsCache().page_size* page_index
			})
			.then(function(posts) {

				//all the media we need
				var primary_ids = posts.reduce(function(acc, crt){
					crt.primary_image_id && acc.push(ObjectID(crt.primary_image_id));
					return acc;
				},[]);

				req.model.getMedia({ _id : {$in : primary_ids} })
				.then(function(media){
					setTimeout(function(){
						res.send({
							status		: "success",
							posts		: posts,
							media		: media
						});
					}, 1000);
				},function(err){
					res.send({
						status: "error",
						message: "something happened when retreiving media files",
						error: json.stringify(err)
					});
				});
			}, function(err){
				res.send({
					status: "error",
					message: "something happened when retreiving post files",
					error: json.stringify(err)
				});
			});
		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}
	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED", "PUBLIC"],
			interfaces: ["json", "web", "admin"]
		},
		method: "POST",
		path: "/system/submit_comment/",
		handler: function(req, res){

			var errs =  req.helpers.validator.validateCommentSubmit(req.body);

			if ( errs.length == 0 ) {
				req.cleanCommentComponents = req.helpers.cleaner.cleanCommentSubmit( req.body );
				req.cleanCommentComponents.id = ShortId.generate();

				req.model.addComment(
					req.cleanCommentComponents
				).then(function(addResult){

					if( addResult.result.n == 1 ) {
						res.send({
							status: "success",
							commentComponents: req.cleanCommentComponents
						});
					} else {
						res.send({
							status: "error",
							message: "Something went wrong. Most likely the Id was was corrupted."
						});
					}
				});
			} else {
				res.send({
					status: "error",
					message: errs.join("<|>")
				});
			}

		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["json", "web", "admin"]
		},
		method: "POST",
		path: "/system/ban_comments/",
		handler: function(req, res){

			req.model.banComments(
				req.body.post_id,
				req.body.comment_ids,
				req.helpers.cleaner.cleanString( req.body.ban_reason )
			).then(function(updateResult){
				res.send({status: "success"})
			}, function(err){
				res.send({
					status: "error",
					message: err.message
				});
			})
		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["json", "web", "admin"]
		},
		method: "POST",
		path: "/system/unban_comments/",
		handler: function(req, res){

			req.model.unbanComments(
				req.body.post_id,
				req.body.comment_ids
			).then(function(updateResult){
				res.send({status: "success"})
			}, function(err){
				res.send({
					status: "error",
					message: err.message
				});
			})
		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["json", "web", "admin"]
		},
		method: "POST",
		path: "/system/delete_comments/",
		handler: function(req, res){

			req.model.deleteComments(
				req.body.post_id,
				req.body.comment_ids
			).then(function(updateResult){
				res.send({status: "success"})
			}, function(err){
				res.send({
					status: "error",
					message: err.message
				});
			})
		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED", "PUBLIC"],
			interfaces: ["json", "web", "admin"]
		},
		method: "POST",
		path: "/system/submit_message/",
		handler: function(req, res){

			var errs =  req.helpers.validator.validateMessageSubmit(req.body);

			if ( errs.length == 0 ) {
				req.cleanMessageComponents = req.helpers.cleaner.cleanMessageSubmit( req.body );

				req.model.addMessage(
					req.cleanMessageComponents
				).then(function(addResult){

					if( addResult.result.n == 1 ) {

						req.model.pushNotification(
							"you received a new message! from " + req.cleanMessageComponents.name,
							"orange",
							{
								url: "/messages/",
								description: "Click here to read the message"
							}
						).then(function(){	
							res.send({
								status: "success"
							});	
						},function(){

							res.send({
								status: "success"
							});
						});

					} else {
						res.send({
							status: "error",
							message: "Something went wrong while adding the message to the database."
						});
					}
				});
			} else {
				res.send({
					status: "error",
					message: errs.join("<|>")
				});
			}

		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["ADMIN", "REGISTERED"],
			interfaces: ["json", "web", "admin"]
		},
		method: "GET",
		path: "/system/get_messages/",
		handler: function(req, res){

			var limit = parseInt(req.query.limit) || 10;
			var skip =  parseInt(req.query.skip) || 0;

			req.model.getMessages(skip,limit)
			.then(function(messages){
				res.send({
					status: "success",
					messages: messages
				});
			}, function(err){
				res.send({
					status: "error",
					message: "Something went wrong when retreiving data from database"
				})
			});


		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	},

	{
		access: {
			sockets: ["PUBLIC"],
			interfaces: ["json", "web", "admin"]
		},
		method: "GET",
		path: "/err/",
		handler: function(req, res){

			if(req.query.m == "500"){
				res.send( req.interface.to("default").render("500",  {err_object: {th:12 , is: " some message", with: ["an", "array"], and: { an: "object"}}}) );
			}


			if(req.query.m == "404"){
				res.send( req.interface.to("default").render("404" ) );
			}


			if(req.query.m == "403"){
				res.send( req.interface.to("default").render("403" ) );
			}



		},
		access_violation : function(req, res){
			res.send({
				status: "error",
				message: "Access violation"
			});
		}

	}
];
