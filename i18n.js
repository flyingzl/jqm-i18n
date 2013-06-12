(function( $, window, undefined ) {
		
	var language =  window.navigator.language.replace("-","_"),

		defaultFolder = "i18n",

		mobile = $.mobile,

		version = mobile.version;
	
		
	mobile.i18n = {
		
		/**
		 * 获得国际化信息
		 * @param {String} key 国际化信息字符串，如"user.name"
		 * @param {Object} context 国际化信息上下文，默认为window.i18n
		 * @method getText
		 */
		getText: function( key, context ){
			if( !key || typeof( key ) !== "string" ) return;
			var parts = key.split("."),
				obj = context || window.i18n || window;
			if ( typeof( obj ) !== "object" ) return;
			for( var i=0, p ; p = parts[i]; i++){
				obj =  ( p in obj ) ? obj[p] : undefined;
		        if ( obj === undefined ) return;
			}
	
			return obj;
		},
		
		
		/**
		 * 处理某个DOM元素中的国际化标签
		 * @param {DOM} 
		 * @return {jQuery} 封装后的jQuery对象
		 */
		applyI18n: function( ele ){
			var $eles = $( ele ),
				getText = this.getText;
			if( $eles.length ===0 ) return;

			var applyContext = function() {
				var inputs = "input,textarea,select",
					$this = $( this ),
					key = $this.attr( "data-i18n" ),
					value = getText( key ),
					reg = new RegExp( "\\b" + this.nodeName.toLowerCase() + "\\b" );
				inputs.match( reg ) ? $this.val( value ) : $this.text( value );
			};
			
			var apply2Ele = function( $ele ) {
				$ele.children().length === 0 ? 
					$ele.each( applyContext ) : 
					$ele.find( "[data-i18n]" ).each( applyContext );
			};

			return $eles.each( function(){
				var $ele = $(this),
					isScriptEle = $ele[0].tagName.toLowerCase() === "script",
					scriptType  = $ele[0].type,
					$div = $("<div></div>");
				if( scriptType === "" || scriptType === "text/javascript" ) return;
				apply2Ele( isScriptEle ? $div.html( $ele.html() ) : $ele );
				isScriptEle && $ele.html( $div.html() );
			});
		},
		
		/**
		 * 获得当前浏览器的语言
		 * @return {String} 返回当前语言类型，如"zh-CN"、"en-US"等
		 */
		getLanguage: function() {
			return language.replace("_","-");
		}
		
	};
	
	
	var loadJSON = function( folder ) { 
		var url = folder + "/" +　language + ".json?_=" + new Date().getTime();
		$.ajax({
			url: url,
			async: false,
			dataType: "json",
			success: function( msg ){
				window.i18n = msg;
			},
			error: function(){
				console.error("error: Could not find file " +  url )
			}
		});
		
	}, i18n = mobile.i18n;
		
	
	// 检测是否开启国际化，用于可以在$(document).bind("mobileinit",function(){})中进行设置
	if( mobile.i18nEnabled ) {
		
		var path = $("script").filter(function(){ return this.src.match(/jquery\.mobile/)})[0].src,
			reg = new RegExp("(.*?)\/\\w+\/jquery\.mobile-" + version +"(?:\.min)?\.js$");
		
		path = path.match(reg)[1];
		
		loadJSON( path + "/" + ( mobile.i18nFolder || defaultFolder ) ) ;
		
		// 页面渲染前进行国际化信息替换
		$(document).bind("pagebeforecreate", function( evt ) { 
			var $page = $( evt.target );
			i18n.applyI18n( $().add( $page ).add( $page.find( "script" ) ) );
		});
   }		

})( jQuery, this );