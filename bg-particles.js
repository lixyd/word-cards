/* 轻量粒子背景：悬浮小方块（两层景深 + 漂浮旋转 + 鼠标视差）
   用法：页面里放 <canvas id="scene"></canvas>，引入 three.min.js 后引入本脚本。 */
(function(){
  if (typeof THREE === 'undefined') return;
  var canvas = document.getElementById('scene');
  if (!canvas) return;
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.6, 7.2);

  var COLORS = [0x4CC9A8, 0x6FB6F0, 0xA78BFA, 0xFFD9A0, 0x7DD3FC];

  function makeLayer(count, spread, size, opacity) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3), col = new Float32Array(count * 3), seeds = [];
    for (var i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * spread;
      pos[i*3+1] = (Math.random() - 0.5) * spread * 0.55;
      pos[i*3+2] = (Math.random() - 0.5) * 22 - 3;
      var c = new THREE.Color(COLORS[(Math.random() * COLORS.length) | 0]);
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
      seeds.push({ spd: 0.2 + Math.random() * 0.6, ph: Math.random() * 6.28 });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: size, vertexColors: true, transparent: true, opacity: opacity,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(pts);
    return { geo: geo, seeds: seeds, count: count, pts: pts };
  }

  // 远层小方块（密、小、慢）+ 近层大方块（疏、大、快）
  var far  = makeLayer(420, 34, 0.06, 0.7);
  var near = makeLayer(140, 26, 0.12, 0.9);

  var mx = 0, my = 0;
  addEventListener('mousemove', function(e){
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = -((e.clientY / innerHeight) * 2 - 1);
  });

  var clock = new THREE.Clock();
  (function animate(){
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    [far, near].forEach(function(L, li){
      var arr = L.geo.attributes.position.array, k = li === 0 ? 1 : 1.8;
      for (var i = 0; i < L.count; i++) {
        arr[i*3+1] += Math.sin(t * L.seeds[i].spd + L.seeds[i].ph) * 0.0016 * k;
        arr[i*3]   += Math.cos(t * L.seeds[i].spd * 0.7 + i) * 0.0010 * k;
      }
      L.geo.attributes.position.needsUpdate = true;
      L.pts.rotation.y = t * (li === 0 ? 0.02 : 0.045);
      L.pts.rotation.z = Math.sin(t * 0.15) * 0.03;
    });
    camera.position.x += (mx * 0.5 - camera.position.x) * 0.04;
    camera.position.y += ((0.6 + my * 0.3) - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();

  addEventListener('resize', function(){
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
})();
