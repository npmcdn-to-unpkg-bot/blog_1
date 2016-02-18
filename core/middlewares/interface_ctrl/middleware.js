//INTERFACE CONTROLLER
module.exports = function(CORE){

	//TODO: find a way not to execute this function on EACH request
	var _extendInterfaceObject = function(int_obj, interface_name){

		int_obj.is = function(name){
			return this.__interface_name === name;
		};

		int_obj.isDefault = function(){
			return (CORE.config.default_interface == this.__interface_name);
		}

		int_obj.checkAccess = function(arr){
			return   (this.isDefault() && arr.indexOf("default") != -1) ||
			 		(arr.indexOf( this.__interface_name ) != -1) ;
		};

		return int_obj;
	};



	var _getInterface = function(req, res){

		//CASE 1: the interface requested trhough URL query by the user is valid
		var interface_name = req.query.interface;
		if( typeof interface_name === "string" && typeof CORE.interfaces[interface_name] === "object" ){

			res.cookie('interface',interface_name, { maxAge: 2 * 24 * 60 * 60 * 1000 , httpOnly: true });
			return _extendInterfaceObject( CORE.interfaces[interface_name], interface_name );
		}

		//CASE 2: the interface requested through cookies is valid
		var interface_name = req.cookies.interface;
		if(  typeof interface_name === "string" && typeof CORE.interfaces[ interface_name ] === "object" ){
			return _extendInterfaceObject( CORE.interfaces[interface_name], interface_name );
		}

		//CASE 3: both the request variable and the cookie interface are wrong or nonexistent: show default interface
		return _extendInterfaceObject( CORE.interfaces[ CORE.config.default_interface ], interface_name );
	}



	return  function (req, res, next) {

		req.interface = _getInterface( req, res );

		next();
	};
};
