var crypto = require('crypto');

var private_key = process.env.PRIVATE_KEY || 'xoCyO5omMAg5BYMrGta3c5aTYs8i6rHSqDr5uoXhl5d9N22j3wuXjI30mCZW';
var hmac_key = crypto.pbkdf2Sync(private_key, 'hmac', 10000, 128, 'sha256').toString('hex');
var encrypt_key = crypto.pbkdf2Sync(private_key, 'encrypt_key', 10000, 24, 'sha256');


module.exports.signAndEncrypt = function(payload, cb) {
  crypto.randomBytes(16, function(err, iv) {
    if (err) {
      cb(err);
      return;
    }
    if (typeof(payload) === 'object')
      payload = JSON.stringify(payload);

    // encrypt the payload
    var cypher = crypto.createCipheriv('AES192', encrypt_key, iv);
    var buf = cypher.update(payload, 'ascii');
    var buf = Buffer.concat([buf, cypher.final()]);
    var encrypted = buf.toString('base64') + '|' + iv.toString('base64');
    var hmac = getHmacFor(encrypted);
    cb(null, encrypted + '|' + hmac);    
  });
}


module.exports.decryptAndCheckSig = function(payload, cb) {
  var split = payload.split('|');
  if (split.length !== 3) {
    return cb('Payload missing data');
  }
  var encrypted = split[0];
  var iv = new Buffer(split[1], 'base64');
  var hmac = split[2];

  // check hmac
  if (getHmacFor(split[0] + '|' + split[1]) !== hmac) {
    return cb('Invalid hmac');
  }

  var decipher = crypto.createDecipheriv('AES192', encrypt_key, iv);
  var ret = decipher.update(split[0], 'base64', 'ascii');
  return cb(null, JSON.parse(ret + decipher.final('ascii')));
}


function getHmacFor(s) {
  var hmac = crypto.createHmac('sha256', hmac_key);
  hmac.update(s);
  return hmac.digest('base64');
}
