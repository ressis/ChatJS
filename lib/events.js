var id = 0

var events = {}
var mappings = {}

var makeArray = function(a) {
	return Array.prototype.slice.call(a)
}

var subscribe = function(obj,eventName,handler) {
	if(mappings[obj] == null) { mappings[obj] = {}; }

	if (handler.event_guid == null) {
		handler.event_guid = id
		id++
	}

	var type = events[eventName] || {}
	//if there is not a special event registered, use a good default
	
	var details = {
		handler: handler,
		type: eventName
	}

	var map = mappings[obj];
	
	if(map[eventName] == null){
		map[eventName] = {}
		type.setup && type.setup.call(obj,details)
	}

	if(!(type.add && type.add.call(obj,details))) {
		map[eventName][handler.event_guid] = details.handler
		return true
	} else {
		return false
	}
}

var deleteHandler = function(obj,map,type,details) {
	if(!(type.remove && type.remove.call(obj,details))) {
		delete map[details.handler.event_guid]
		return details.handler
	}
}

var unsubscribe = function(obj,eventName,handler) {
	var removed = []
	var gen_map = mappings[obj]
	if(!gen_map) { return removed } //short circuit if you know there are no handlers on this object
	
	var map = gen_map[eventName]
	if(!map) { return removed } //short circuit if you know there are no handlers on this object for this event
	if(handler && !map[handler.event_guid]) {return removed} //short circuit if the handler was never attached

	var type = events[eventName] || {}
	var handlers = 0
	var details = {
		type: eventName
	}

	if(handler) {
		details.handler = handler
		var h = deleteHandler(obj,map,type,details)
		h && removed.unshift(h)
	} 

	var anyLeft = false
	for(var k in map) {
		if(map.hasOwnProperty(k)) {
			if(!handler) {
				details.handler = map[k]
				var h = deleteHandler(obj,map,type,details)
				h && removed.unshift(h)
			} else {
				anyLeft = true
			}
		}
	}

	if(!anyLeft) {
		delete gen_map[eventName]
		details.handler = handler
		type.teardown && type.teardown.call(obj,details)
	}
}

var trigger = function(obj,eventName) {
	var gen_map = mappings[obj]
	if(!gen_map) { return false } //short circuit if you know there are no handlers on this object

	var map = gen_map[eventName]
	if(!map) { return false } //short circuit if you know there are no handlers on this object for this event

	var args = makeArray(arguments)
	args.shift() // dump the object reference
	args.shift() // dump the event name

	for(var k in map) {
		map[k].apply(obj,args)
	}

	return true
}

exports.subscribe = subscribe
exports.unsubscribe = unsubscribe
exports.trigger = trigger
