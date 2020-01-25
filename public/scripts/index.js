const fadeJug = function() {
  waterJugBox.style['visibility'] = 'hidden';
  setTimeout(() => {
    waterJugBox.style['visibility'] = 'visible';
  }, 1000);
};

const attachEventListener = function() {
  document.getElementById('waterJugBox').addEventListener('click', fadeJug);
};

const main = function() {
  attachEventListener();
};
