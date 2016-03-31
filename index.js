"use strict";

var __DEV__ = false;
try {
  __DEV__ = process.env.NODE_ENV !== 'production';
} catch (e) {}

var maybeWarn = ! __DEV__ ? function() {} : function() {
  console.warn(
    'Reducer contains an \'undefined\' action type. ' +
    'Have you misspelled a constant?'
  );
};

/**
 * Flatten a nested object of reducer definitions up to the first
 * level of nesting.
 *
 * Example:
 * ------BEFORE---------+---------AFTER-----------
 * {                    | {
 *   Parent: {          |    Parent_Child1() {
 *     Child1() {       |    },
 *     },               |
 *                      |    Parent_Child2() {
 *     Child2() {       |    },
 *     },               |
 *   },                 |    Firstlevel() {
 *                      |    }
 *   Firstlevel() {     |
 *   }                  | }
 * }                    |
 *
 * @param  {object}  reducers  (Nested) reducer definition object
 * @param  {string*} glue  String to concat names with, optional, default: '_'
 * @return  {object}  Flattened object
 */
var flattenReducers = function flattenReducers(reducers, glue) {
  glue || ( glue = '_' );
  var output = {};

  var keys = Object.keys( reducers )
                    .forEach( function(key) {
                      var sub = reducers[key];

                      // If it is an object we glue pieces together
                      if( null !== sub && 'object' === typeof sub ) {
                        if( sub['undefined'] )
                          maybeWarn();

                        Object.keys( sub )
                              .forEach( function(subkey) {
                                output[ key + glue + subkey ] = sub[subkey];
                              });
                      }
                      else
                        output[key] = sub;

                    });

  return output;
};

exports.createReducer = function createReducer(initialState, handlers) {
  if ( handlers['undefined'] )
    maybeWarn();

  var flattened = flattenReducers( handlers );

  return function reducer(state, action) {
    if (state === undefined) state = initialState;

    if (flattened.hasOwnProperty(action.type)) {
      return flattened[action.type](state, action);
    } else {
      return state;
    }
  };
};
