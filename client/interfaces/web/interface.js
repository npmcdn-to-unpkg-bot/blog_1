
module.exports = function(CORE, interface_name){

	var web_intf = CORE.factories.interface();


	var doT = require("dot");
	web_intf.dots = doT.process({path: "./client/interfaces/web/views"});

	web_intf.view('homepage', function(data){

		return web_intf.dots.react_base({
			pageData : data
		});
	});


	web_intf.view('contact', function(data){

		return web_intf.dots.react_base({});

	});


	web_intf.view('login', function(data){
		return web_intf.dots.react_base({
			pageData: data
		});
	});



	web_intf.view('post', function(data){

		return web_intf.dots.react_base({
			pageData : data
		});
	});

	web_intf.view('404', function(data){
		return "404";
	});

	web_intf.view('403', function(data){
		return "403";
	});


	web_intf.view('500', function(data){
		return "500";
	});

	return web_intf;
};
