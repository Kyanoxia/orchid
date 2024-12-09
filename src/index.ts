import CustomClient from "./base/classes/CustomClient";
import { atInfo, getDIDValidity, getHandleValidity, isValid } from "./base/utility/atproto";

// #################### TIMESTAMP LOGS #################### //
var log = console.log;
var info = console.info;
var warn = console.warn;
var error = console.error;

console.log = function () {
    const preface = `[${Date.now()}][LOG]  -  `
    log.apply(console, [preface, ...arguments]);
};

console.info = function () {
    const preface = `[${Date.now()}][INFO] -  `
    info.apply(console, [preface, ...arguments]);
};

console.warn = function () {
    const preface = `[${Date.now()}][WARN] -  `
    warn.apply(console, [preface, ...arguments]);
};

console.error = function () {
    const preface = `[${Date.now()}][ERROR] - `
    error.apply(console, [preface, ...arguments]);
};

// #################### CLIENT CREATION #################### //
(new CustomClient).init();
