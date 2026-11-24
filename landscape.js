(() => {
  const canvas = document.getElementById('landscape');
  const boundaries = document.getElementById('boundaries');
  if (!canvas || !boundaries) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  const rowCount = 42;
  const sampleCount = 200;
  const accent = '#c34c27';
  const tau = Math.PI * 2;

  // A synthetic surface for explaining the idea, independent of empirical traces.
  function heightAt(t, depth) {
    const envelope = Math.pow(Math.sin(Math.PI * t), 0.7);
    const ridge = (center, width) => Math.exp(-Math.pow((t - center) / width, 2));
    const left = ridge(0.205 + 0.045 * depth, 0.071) * (0.20 + 0.16 * depth);
    const middle = ridge(0.48 + 0.063 * Math.sin(depth * 3.4), 0.105)
      * (0.39 + 0.48 * Math.exp(-Math.pow((depth - 0.65) / 0.36, 2)));
    const right = ridge(0.785 - 0.057 * depth, 0.078)
      * (0.27 + 0.21 * Math.sin(depth * 3.2 + 0.5));
    const folds = 1 + 0.125 * Math.sin(tau * (t * 8.1 + depth * 0.92))
      + 0.075 * Math.sin(tau * (t * 16.8 - depth * 0.80));
    const foothills = 0.033 + 0.019 * Math.cos(tau * (t * 5.4 - depth * 0.76));
    return envelope * (foothills + (left + middle + right) * folds);
  }

  const rows = Array.from({ length: rowCount }, (_, r) => {
    const depth = r / (rowCount - 1);
    return Array.from({ length: sampleCount + 1 }, (_, i) => {
      const t = i / sampleCount;
      return {
        x: 0.035 + 0.765 * t + 0.165 * depth,
        floor: 0.81 + 0.095 * t - 0.305 * depth,
        height: heightAt(t, depth),
      };
    });
  });

  // Select one local summit per lobe of the highlighted trace.
  const front = rows[0];
  const peaks = [[0.08, 0.34], [0.35, 0.64], [0.65, 0.91]].map(([from, to]) =>
    front.slice(Math.ceil(from * sampleCount), Math.floor(to * sampleCount) + 1)
      .reduce((highest, point) => point.height > highest.height ? point : highest),
  );

  function draw() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const pixelsWide = Math.round(width * ratio);
    const pixelsHigh = Math.round(height * ratio);
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
    }
    context.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
    context.clearRect(0, 0, width, height);
    context.lineJoin = 'round';
    context.lineCap = 'round';
    const weight = Math.max(0.76, Math.min(1.25, width / 490));
    const surfaceY = point => (point.floor - 0.52 * point.height) * height;

    for (let r = rowCount - 1; r >= 0; r--) {
      const row = rows[r];
      const first = row[0];
      const last = row[sampleCount];
      const line = new Path2D();
      line.moveTo(first.x * width, surfaceY(first));
      for (const point of row.slice(1)) line.lineTo(point.x * width, surfaceY(point));

      // Occlude the more distant traces without painting a background.
      const face = new Path2D(line);
      face.lineTo(last.x * width, last.floor * height);
      face.lineTo(first.x * width, first.floor * height);
      face.closePath();
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = '#000';
      context.fill(face);
      context.globalCompositeOperation = 'source-over';

      context.strokeStyle = r === 0 ? accent : 'rgba(25,45,37,0.88)';
      context.lineWidth = (r === 0 ? 2.3 : 0.96) * weight;
      context.stroke(line);
    }

    if (boundaries.checked) {
      for (const point of peaks) {
        const x = point.x * width;
        const y = surfaceY(point);
        context.strokeStyle = accent;
        context.lineWidth = weight;
        context.setLineDash([2 * weight, 3 * weight]);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, point.floor * height + 5 * weight);
        context.stroke();
        context.setLineDash([]);
        context.beginPath();
        context.arc(x, y, 3.1 * weight, 0, tau);
        context.fillStyle = '#f5f6ed';
        context.fill();
        context.lineWidth = 1.8 * weight;
        context.stroke();
      }
    }
  }

  boundaries.addEventListener('change', draw);
  new ResizeObserver(draw).observe(canvas);
  window.addEventListener('resize', draw);
  draw();
})();
