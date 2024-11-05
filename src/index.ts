import CustomClient from "./base/classes/CustomClient";

// #################### TIMESTAMP LOGS #################### //
var log = console.log;
var info = console.info;
var warn = console.warn;
var error = console.error;

console.log = function( obj, ...placeholders ){
    if ( typeof obj === 'string' )
        placeholders.unshift( `[${Date.now()}][LOG]` + " " + obj );
    else
    {
        placeholders.unshift( obj );
        placeholders.unshift( `[${Date.now()}][LOG]` + " %j" );
    }

    log.apply( this, placeholders );
};

console.info = function( obj, ...placeholders ){
    if ( typeof obj === 'string' )
        placeholders.unshift( `[${Date.now()}][INFO]` + " " + obj );
    else
    {
        placeholders.unshift( obj );
        placeholders.unshift( `[${Date.now()}][INFO]` + " %j" );
    }

    info.apply( this, placeholders );
};

console.warn = function( obj, ...placeholders ){
    if ( typeof obj === 'string' )
        placeholders.unshift( `[${Date.now()}][WARN]` + " " + obj );
    else
    {
        placeholders.unshift( obj );
        placeholders.unshift( `[${Date.now()}][WARN]` + " %j" );
    }

    warn.apply( this, placeholders );
};

console.error = function( obj, ...placeholders ){
    if ( typeof obj === 'string' )
        placeholders.unshift( `[${Date.now()}][ERROR]` + " " + obj );
    else
    {
        placeholders.unshift( obj );
        placeholders.unshift( `[${Date.now()}][ERROR]` + " %j" );
    }

    error.apply( this, placeholders );
};

// #################### CLIENT CREATION #################### //
(new CustomClient).init();
