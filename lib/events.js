var utility = require('utility.js')
var id = 0

var tag = function(item) {
	if(!item.event_guid) {
		item.event_guid = id
		id++
	}
	return item.event_guid
}

var events = {}
var mappings = {}

var get_by_namespace = function(event_map, namespace) {
	// all events
	if(!namespace) {
		var values = utility.all_values(event_map)
		return utility.fold_right(function(a,b) { return a.concat(b) }, [], values)
	} else { // for a specific namespace
		event_map[namespace] = event_map[namespace] || []
		return event_map[namespace]
	}
}

var get_by_event = function(map, event_name, namespace) {
	// all events
	if(!event_name) {
		var values = utility.all_values(map)
		return utility.fold_right(function(a,b) { return a.concat(get_by_namespace(b)) },[],values)
	} else {	// one event
		map[event_name] = map[event_name] || {}
		return get_by_namespace(map[event_name],namespace)
	}
}

var get_handler_map = function(obj) {
	var t = tag(obj)
	if(!mappings[t]) {
		mappings[t] = {}
	}
	return mappings[t]
}

var get_inner_map = function(map,key) {
	map[key] = map[key] || {}
	return map[key]
}

var insert_handler = function(obj,event_name,namespace,handler) {
	if(!handler) { return false }
	if(!obj) { return false }
	if(!event_name) { return false}

	var handler_tag = tag(handler)

	var map = get_handler_map(obj)
	var event_map = get_inner_map(map,event_name)
	if(namespace) {
		var handlers = get_inner_map(event_map,namespace)
		handlers[handler_tag] = handler
	} else {
		var handlers = get_inner_map(event_map,null)
		handlers[handler_tag] = handler
	}
	return true
}

var remove_handler = function(obj,event_name,namespace,handler) {
	if(!obj) { return false }
	if(!event_name) { return false }

	var map = get_handler_map(obj)
	if(namespace) {
		var event_map = get_inner_map(map,event_name)
		if(handler) {
			var handlers = get_inner_map(event_map,namespace)
			if(handlers[tag(handler)]) {
				delete handlers[tag(handler)]
				return true
			} else {
				return false
			}
		} else {
			delete event_map[namespace]
			return true
		}
	} else {
		delete map[event_name]
		return true
	}

	return false // do not allow deleting all events at once
}

var raise_event = function(obj,event_name,namespace,params) {
	if(!obj) { return false }
	var handlers = get_by_event(get_handler_map(obj),event_name,namespace)
	for(var handler in handlers) {
		handler.apply(obj,params)
	}
}

var subscribe = function(obj,eventName,handler) {
}

var unsubscribe = function(obj,eventName,handler) {
}

var trigger = function(obj,eventName) {
}

exports.subscribe = subscribe
exports.unsubscribe = unsubscribe
exports.trigger = trigger
