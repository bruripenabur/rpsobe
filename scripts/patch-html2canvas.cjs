const fs = require("fs");
const path = require("path");

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");

  const target = 'throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"");';
  const replacement = `try {
                    if (typeof document !== 'undefined') {
                        var _c = document.createElement('canvas');
                        _c.width = 1; _c.height = 1;
                        var _ctx = _c.getContext('2d');
                        if (_ctx) {
                            var _raw = value.name + '(' + (value.values || []).map(function(t) {
                                if (!t) return '';
                                if (typeof t.number === 'number') return t.type === 16 ? t.number + '%' : t.number;
                                if (t.value !== undefined) return t.value;
                                return '';
                            }).filter(Boolean).join(' ') + ')';
                            _ctx.fillStyle = '#00000000';
                            _ctx.fillStyle = _raw;
                            var _cs = _ctx.fillStyle;
                            if (_cs.startsWith('#')) {
                                var _hx = parseInt(_cs.slice(1), 16);
                                if (_cs.length === 4) {
                                    var _r = parseInt(_cs[1] + _cs[1], 16), _g = parseInt(_cs[2] + _cs[2], 16), _b = parseInt(_cs[3] + _cs[3], 16);
                                    return pack(_r, _g, _b, 1);
                                }
                                return pack((_hx >> 16) & 255, (_hx >> 8) & 255, _hx & 255, 1);
                            }
                            var _m = _cs.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
                            if (_m) {
                                return pack(parseInt(_m[1]), parseInt(_m[2]), parseInt(_m[3]), _m[4] ? parseFloat(_m[4]) : 1);
                            }
                        }
                    }
                } catch (_err) {}
                return 0x00000000;`;

  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Successfully patched:", filePath);
  } else {
    console.log("Target not found or already patched:", filePath);
  }
}

patchFile(path.join(__dirname, "../node_modules/html2canvas/dist/html2canvas.js"));
patchFile(path.join(__dirname, "../node_modules/html2canvas/dist/html2canvas.esm.js"));
patchFile(path.join(__dirname, "../node_modules/html2pdf.js/dist/html2pdf.bundle.js"));
