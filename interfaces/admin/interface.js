
module.exports = function(CORE, interface_name){

	var admin_intf = CORE.factories.interface();


	var doT = require("dot");


	admin_intf.dots = doT.process({path: "./interfaces/admin/views"});
	admin_intf.fragments = doT.process({path: "./interfaces/admin/views/fragments"});





	/*
		The main Admin Page.
	*/
	admin_intf.view('admin_panel', function(data){

		return admin_intf.dots.main_panel({
			fragments: admin_intf.fragments,
			notifications: data.notifications
		});
	});


	admin_intf.view('settings', function(data){

		return admin_intf.dots.settings({
			fragments: admin_intf.fragments,
			notifications: data.notifications
		});
	});



	/*
		The post list page.
	*/
	admin_intf.view('posts', function(data){
		return admin_intf.dots.posts({
			fragments: admin_intf.fragments,
			posts: data.posts
		});
	});



	/*
		The new post page.
	*/
	admin_intf.view('new_post', function(data){
		return admin_intf.dots.post({
			fragments: admin_intf.fragments
		});
	});










	/*
		Edit post page
	*/

	admin_intf.view('edit_post', function(post){

		return admin_intf.dots.post({
				header: admin_intf.fragments.header({}),
				footer: admin_intf.fragments.footer({}),
				name: "Beni",
				post: post
			});
	});


	return admin_intf;
};
