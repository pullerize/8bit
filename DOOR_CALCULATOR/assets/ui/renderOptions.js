import { glassOptions } from '../data/glassOptions.js';
import { shotlanOptions, hideWithRiffled } from '../data/shotlanOptions.js';
import { images } from '../data/images.js'; // если есть

export function renderGlassOptions(glassDiv, glassDivDataset, updateShotlanOptions, step3, lines, step4) {
  glassDiv.innerHTML = '';
  glassOptions.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.dataset.value = opt;
    const src = images.glass[opt];
    const imgTag = src ? `<img class="icon" src="${src}" alt="">` : '<span class="icon"></span>';
    div.innerHTML = imgTag + '<span>' + opt + '</span>';
    div.addEventListener('click', () => {
      glassDiv.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      glassDiv.dataset.selected = opt;
      updateShotlanOptions();
      step3.textContent = opt;
      step3.classList.add('active');
      lines[1].classList.add('active');
      step4.classList.remove('active');
      lines[2].classList.remove('active');
    });
    glassDiv.appendChild(div);
  });
  updateShotlanOptions();
}
