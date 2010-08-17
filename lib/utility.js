exports.make_array = function(array_like_object) {
	array_like_object = array_like_object || this
	return Array.prototype.slice.call(array_like_object)
}

exports.fold_right = function(op,initial,collection) {
	op = op || function() {}
	a = exports.make_array(collection || this)
	value = initial

	for(var i = 0; i < a.length; i++) {
		if(value == null){
			value = a[i]
			continue
		} else {
			value = op(value, a[i])
		}
	}

	return value
}

exports.map = function(op,collection) {
	op = op || function() {return this}
	a = exports.make_array(collection || this)
	var r = []
	for(var i = 0; i < a.length; i++) {
		r[i] = op.call(a[i],a[i])
	}
}

exports.all_keys = function(map) {
	var r = []
	for(var k in map) {
		if(map.hasOwnProperty(k)) {
			r[r.length] = k
		}
	}
	return r
}

exports.all_values = function(map,keys) {
	keys = keys || exports.all_keys(map)
	var r = []
	for(var k in keys) {
		r[r.length] = map[k]
	}
	return r
}


