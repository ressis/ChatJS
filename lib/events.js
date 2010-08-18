var utility = require('utility.js')
var id = 0

// given an object, return its object tag
var tag = function(item) {
	if(!item.event_guid) {
		item.event_guid = id
		id++
	}
	return item.event_guid
}

// maps object tags to event maps
var mappings = {}

// given an object, return its event map
// guarentee the object to *have* an event map,
// even if it is empty
var get_initial_event_map = function(obj) {
	var t = tag(obj)
	if(!mappings[t]) { mappings[t] = {} }
	return mappings[t]
}

// event maps are recursive structures, where named
// keys are keys to sub event maps, and the null
// key is an array of handlers attached to the
// event at that level of specificity.
// This function returns the event map given
// the highest level event map and an array
// of event namespaces
var get_event_mapping_for = function(map,event_name_array) {
	if(event_name_array.length == 0) {
		if(!map['']) { map[''] = [] }
		return map
	} else {
		var namespace = event_name_array[0]
		if(!map[namespace]) {map[namespace] = {}}
		return get_event_mapping_for(map[namespace],event_name_array.slice(1))
	}
}

// given an event map, collect all handlers at that
// level and below. Return as an array
var collect_handlers_for = function(event_map) {
	var handlers = []
	var event_keys = utility.all_keys(event_map)
	for(var i = 0; i < event_keys.length;i++) {
		var k = event_keys[i]
		if(k == '') {
			handlers = handlers.concat(event_map[k])
		} else {
			handlers = handlers.concat(collect_handlers_for(event_map[k]))
		}
	}
	return handlers
}

// given a top level map and an array of event
// namespaces, return a single array that
// contains all handlers that should execute
var collect_handlers = function(map,event_name_array) {
	if(!event_name_array) { return [] }
	if(!map) { return [] }
	var event_map = get_event_mapping_for(map,event_name_array)
	return collect_handlers_for(event_map)
}

// add an event handler to the object. event names
// are strings with namespaces delimited by periods.
// The string stuffwaiting.side3 is the stuffwaiting
// event, limited to the side3 namespace.
// there is no limit to the number of nested namespaces
// allowed.
// Returns true if registration was successful and false otherwise
var subscribe = function(obj,event_name,handler) {
	if(!obj) { return false }
	if(!event_name) { return false }
	if(!handler) { return false }
	var map = get_initial_event_map(obj)
	var event_namespaces = event_name.split('.')
	var events = get_event_mapping_for(map,event_namespaces)['']
	events[events.length] = handler
	return true
}

// removes an event handler from the object. If given a
// more less specific namespace, more specific event
// handlers will be removed.
// Removing stuffwaiting.side3 will also remove
// stuffwaiting.side3.activation
// However, given a non-null handler, it will only remove
// that handler.
// Returns false on error and true if the described
// event handlers will no longer execute.
var unsubscribe = function(obj,event_name,handler) {
	if(!obj) { return false }
	if(!event_name) { return false }
	var map = get_initial_event_map(obj)
	var event_namespaces = event_name.split('.')
	var namespaces = get_event_mapping_for(map,event_namespaces)
	var events = namespaces['']
	if(handler) {
		for(var i = 0; i < events.length;) {
			if(events[i] == handler) {
				events.splice(i,1)
			} else { i++ }
		}
		return true
	} else {
		var keys = utility.all_keys(namespaces)
		utility.map.call(keys,function(key) { return delete namespaces[key] })
		return true
	}
}

// given a namespace (as described by the
// subscribe comment), execute all handlers
// attached to the given object.
var trigger = function(obj,event_name) {
	if(!obj) { return false }
	if(!event_name) { return false }
	var map = get_initial_event_map(obj)
	var event_namespaces = event_name.split('.')
	var handlers = collect_handlers(map,event_namespaces)
	var args = utility.make_array(arguments)
	args.splice(0,2)
	// pass all arguments after obj and event_name to the handlers
	for(var i = 0; i < handlers.length; i ++) {
		var h = handlers[i]
		h.apply(obj,args)
	}
}

exports.subscribe = subscribe
exports.unsubscribe = unsubscribe
exports.trigger = trigger
exports.debug = { map:mappings, giem:get_initial_event_map, ch:collect_handlers, chf:collect_handlers_for, gemf:get_event_mapping_for }
