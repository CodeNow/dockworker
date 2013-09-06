;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
mocha.setup({globals: ['start', 'term', 'pty']});

describe('terminal', function (){
  it('should define start', function (){
    if (typeof window.start !== 'function') {
      throw new Error('start not defined');
    }
  });

  it('should start cleanly', function (){
    window.start('http://localhost:15000/streams/terminal');
  });

  it('should define term', function (done) {
    setTimeout(function () {
      if (window.term == null) {
        throw new Error('term not defined')
      } else {
        done();
      }
    }, 200);
  });

  it('should define pty', function (done) {
    setTimeout(function () {
      if (window.pty == null) {
        throw new Error('pty not defined')
      } else {
        done();
      }
    }, 200);
  });

  it('should echo some data', function (done) {
    pty.once('data', function (data) {
      if (!/echo foo\\r?\\nfoo/.test(JSON.stringify(data))) {
        console.error('BAD DATA',JSON.stringify(data));
        done(new Error('y u no foo'))
      }
      done();
    });
    pty.write('echo foo\n');
  });
});
},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvaHRpbGZvcmQvZG9ja3dvcmtlci9jbGllbnRUZXN0cy90ZXJtaW5hbFRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJtb2NoYS5zZXR1cCh7Z2xvYmFsczogWydzdGFydCcsICd0ZXJtJywgJ3B0eSddfSk7XG5cbmRlc2NyaWJlKCd0ZXJtaW5hbCcsIGZ1bmN0aW9uICgpe1xuICBpdCgnc2hvdWxkIGRlZmluZSBzdGFydCcsIGZ1bmN0aW9uICgpe1xuICAgIGlmICh0eXBlb2Ygd2luZG93LnN0YXJ0ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0YXJ0IG5vdCBkZWZpbmVkJyk7XG4gICAgfVxuICB9KTtcblxuICBpdCgnc2hvdWxkIHN0YXJ0IGNsZWFubHknLCBmdW5jdGlvbiAoKXtcbiAgICB3aW5kb3cuc3RhcnQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MTUwMDAvc3RyZWFtcy90ZXJtaW5hbCcpO1xuICB9KTtcblxuICBpdCgnc2hvdWxkIGRlZmluZSB0ZXJtJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh3aW5kb3cudGVybSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndGVybSBub3QgZGVmaW5lZCcpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb25lKCk7XG4gICAgICB9XG4gICAgfSwgMjAwKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBkZWZpbmUgcHR5JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh3aW5kb3cucHR5ID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwdHkgbm90IGRlZmluZWQnKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIDIwMCk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgZWNobyBzb21lIGRhdGEnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgIHB0eS5vbmNlKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGlmICghL2VjaG8gZm9vXFxcXHI/XFxcXG5mb28vLnRlc3QoSlNPTi5zdHJpbmdpZnkoZGF0YSkpKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0JBRCBEQVRBJyxKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIGRvbmUobmV3IEVycm9yKCd5IHUgbm8gZm9vJykpXG4gICAgICB9XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgcHR5LndyaXRlKCdlY2hvIGZvb1xcbicpO1xuICB9KTtcbn0pOyJdfQ==
;