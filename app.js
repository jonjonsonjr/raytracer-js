var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var id = context.createImageData(1, 1);
var data = id.data;

var g = norm(V(-6, -16, 0));

var a = scale(norm(cross(V(0, 0, 1), g)), .002);
var b = scale(norm(cross(g, a)), .002);
var c = add(scale(add(a, b), -256), g);

var G = [16, 16, 231184, 18577, 18578, 249748, 280600, 280596, 247570];

function draw(q, g) {
  G = g ? g : G;
  setTimeout(function() { drawRow(0, q); }, 0);
}

var drawRow = function (y, quality) {
  for (var x = 0; x < 512; x++) {
    var p = V(13, 13, 13);

    for (var i = 0; i < quality; i++) {
      var t = add(scale(scale(a, rand() - .5), 99), scale(scale(b, rand() - .5), 99));

      var q = sample(
        add(V(17, 16, 8), t),
        norm(add(scale(t, -1.0),scale(add(add(scale(a, rand() + x),scale(b, rand() + 511 - y)), c), 16)))
      );

      p = add(scale(q, 3.5 * (64 / quality)), p);
    }

    data[0] = p.x;
    data[1] = p.y;
    data[2] = p.z;
    data[3] = 255;

    context.putImageData(id, 511 - x, y);
  }

  if (y < 512) {
    setTimeout(function () { drawRow(++y, quality); }, 0);
  }
};

function sample(o, d) {
  var s = trace(o, d);
  var t = s.t;
  var n = s.n;
  var m = s.m;

  if (m == 0) {
    return scale(V(.7, .6, 1), pow(1 - d.z, 4));
  }

  var h = add(o, scale(d, t));
  var l = norm(add(V(9 + rand(), 9 + rand(), 16), scale(h, -1)));
  var r = add(d, scale(n, dot(n, d) * -2));

  var b  = dot(l, n);

  if (b < 0 || trace(h, l).m != 0) {
    b = 0;
  }

  var p = pow(dot(l, r) * ((b > 0) ? 1 : 0), 99);

  if ((m & 1) != 0) {
    h = scale(h, .2);

    if ((ceil(h.x) + ceil(h.y)) & 1 != 0) {
      return scale(V(3, 1, 1), b * .2 + .1);
    } else {
      return scale(V(3, 3, 3), b * .2 + .1);
    }
  }

  return add(V(p, p, p), scale(sample(h, r), .5));
}

function trace(o, d) {
  var n = V(0, 0, 0);
  var t = 1000000000;
  var m = 0;
  var p = -o.z / d.z;

  if (p > .01) {
    t = p;
    n = V(0, 0, 1);
    m = 1;
  }

  for (var k = 18; k >= 0; k--) {
    for (var j = 0; j < 9; j++) {
      if ((G[j] & 1 << k) != 0) {
        var vp = add(o, V(-k, 0, j - 12));
        var b = dot(vp, d);
        var c = dot(vp, vp) - 1;
        var q = b * b - c;

        if (q > 0) {
          var s = -b - sqrt(q);

          if (s < t && s > .01) {
            t = s;
            n = norm(add(vp, scale(d, t)));
            m = 2;
          }
        }
      }
    }
  }

  return {m: m, t: t, n: n};
}

function V(x, y, z) {
  return {
    x: x,
    y: y,
    z: z
  };
}

function add(a, b) {
  return V(a.x + b.x, a.y + b.y, a.z + b.z);
}

function scale(v, s) {
  return V(v.x * s, v.y * s, v.z * s);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
  return V(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

function norm(v) {
  return scale(v, (1.0 / sqrt(dot(v, v))));
}

function sqrt(n) {
  return Math.sqrt(n);
}

function rand() {
  return Math.random();
}

function pow(b, e) {
  return Math.pow(b, e);
}

function ceil(n) {
  return Math.ceil(n);
}