var sha1 = require('./lib/sha1-browser');
var bytesToUuid = require('./lib/bytesToUuid');

var bufferIsSupported = (Object.prototype.toString.call(Buffer) === '[object Function]');

function uuidToBytes(uuid) {
  // Note: We assume we're being passed a valid uuid string
  var bytes = [];
  uuid.replace(/[a-fA-F0-9]{2}/g, function(hex) {
    bytes.push(parseInt(hex, 16));
  });

  return bytes;
}

function stringToBytes(str) {
  str = unescape(encodeURIComponent(str)); // UTF8 escape
  var bytes = new Array(str.length);
  for (var i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

function bufferToBytes(buf) {
  var bytes = new Array(buf.length);
  for (var i = 0; i < buf.length; i++) {
    bytes[i] = buf.readUInt8(i);
  }
  return bytes;
}

function v5(name, namespace, buf, offset) {
  var off = buf && offset || 0;
  
  if (bufferIsSupported && typeof(name) == 'object' && name instanceof Buffer) name = bufferToBytes(name);
  else if (typeof(name) == 'string') name = stringToBytes(name);
  if (typeof(namespace) == 'string') namespace = uuidToBytes(namespace);

  if (!Array.isArray(name)) throw TypeError('name must be an array of bytes');
  if (!Array.isArray(namespace) || namespace.length != 16) throw TypeError('namespace must be uuid string or an Array of 16 byte values');

  // Per 4.3
  var bytes = sha1(namespace.concat(name));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  if (buf) {
    for (var idx = 0; idx < 16; ++idx) {
      buf[off+idx] = bytes[idx];
    }
  }

  return buf || bytesToUuid(bytes);
}

// Pre-defined namespaces, per Appendix C
v5.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
v5.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
v5.OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
v5.X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

module.exports = v5;
