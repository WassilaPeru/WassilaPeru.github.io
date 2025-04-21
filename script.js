const container = document.getElementById("container");
const viewport = document.getElementById("viewport");
const sidebar = document.getElementById("sidebar");
const contentDiv = document.getElementById("content");

let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX, startY;

fetch('story.html')
  .then(res => res.text())
  .then(data => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    const passages = doc.querySelectorAll('tw-passagedata');

    passages.forEach(p => {
      const name = p.getAttribute('name')?.replace(/&#39;/g, "'") || 'Untitled';
      const [x, y] = p.getAttribute('position').split(',').map(Number);
      const box = document.createElement('div');
      box.className = 'box';
      box.style.left = `${x}px`;
      box.style.top = `${y}px`;
      box.style.width = p.getAttribute('size').split(',')[0] + 'px';
      box.style.height = p.getAttribute('size').split(',')[1] + 'px';
      box.textContent = name;

      box.addEventListener('click', () => {
        contentDiv.innerHTML = p.innerHTML.trim();
        sidebar.classList.add('open');
      });

      viewport.appendChild(box);
    });
  });

// Zoom with mouse wheel
container.addEventListener("wheel", (e) => {
  e.preventDefault();
  const scaleAmount = -e.deltaY * 0.001;
  const newScale = Math.min(Math.max(0.1, scale + scaleAmount), 5);
  const rect = container.getBoundingClientRect();
  const dx = (e.clientX - rect.left - originX) / scale;
  const dy = (e.clientY - rect.top - originY) / scale;

  originX -= dx * (newScale - scale);
  originY -= dy * (newScale - scale);
  scale = newScale;
  updateTransform();
});

// Pan with click-drag
container.addEventListener("mousedown", (e) => {
  isPanning = true;
  container.style.cursor = 'grabbing';
  startX = e.clientX - originX;
  startY = e.clientY - originY;
});

container.addEventListener("mouseup", () => {
  isPanning = false;
  container.style.cursor = 'grab';
});

container.addEventListener("mouseleave", () => {
  isPanning = false;
  container.style.cursor = 'grab';
});

container.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  originX = e.clientX - startX;
  originY = e.clientY - startY;
  updateTransform();
});

function updateTransform() {
  viewport.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
}

// Close sidebar on click outside
document.addEventListener('click', (e) => {
  if (!sidebar.contains(e.target) && !e.target.classList.contains('box')) {
    sidebar.classList.remove('open');
  }
});
