document.addEventListener('DOMContentLoaded', () => {
  const blocksInput = document.getElementById('blocks');
  const container = document.getElementById('blocksContainer');
  const generateBtn = document.getElementById('generateBtn');

  // Restaurar número de blocos salvos e gerar
  const savedBlocks = localStorage.getItem('totalBlocks');
  if (savedBlocks) {
    blocksInput.value = savedBlocks;
    generateBlocks(parseInt(savedBlocks));
  }

  generateBtn.addEventListener('click', () => {
    const blocks = parseInt(blocksInput.value);
    if (isNaN(blocks) || blocks < 1) {
      alert('Por favor, insira um número válido de blocos.');
      return;
    }
    localStorage.setItem('totalBlocks', blocks);
    generateBlocks(blocks);
  });

  function generateBlocks(blocks) {
    container.innerHTML = '';

    for (let i = 1; i <= blocks; i++) {
      // Puxa dados salvos do localStorage
      const data = JSON.parse(localStorage.getItem(`block_${i}`)) || {
        title: `Semana ${i}`,
        weight: '',
        measures: '',
        notes: '',
      };

      const block = document.createElement('div');
      block.className = 'block';

      block.innerHTML = `
        <h2 class="block-title" contenteditable="true" id="title_${i}">${data.title}</h2>

        <label>📸 Fotos (não são salvas):</label>
        <input type="file" accept="image/*" multiple />

        <label>⚖️ Peso (kg):</label>
        <input type="number" step="0.1" id="weight_${i}" value="${data.weight}" />

        <label>📏 Medidas:</label>
        <input type="text" id="measures_${i}" value="${data.measures}" />

        <label>📝 Observações:</label>
        <input type="text" id="notes_${i}" value="${data.notes}" />
      `;

      container.appendChild(block);

      // Salva as mudanças do título (com debounce simples)
      const titleEl = document.getElementById(`title_${i}`);
      let titleTimeout;
      titleEl.addEventListener('input', () => {
        clearTimeout(titleTimeout);
        titleTimeout = setTimeout(() => {
          saveBlock(i);
        }, 500);
      });

      // Salva as mudanças nos inputs
      ['weight', 'measures', 'notes'].forEach(field => {
        const input = document.getElementById(`${field}_${i}`);
        input.addEventListener('input', () => {
          saveBlock(i);
        });
      });
    }
  }

  function saveBlock(i) {
    const title = document.getElementById(`title_${i}`).textContent.trim() || `Semana ${i}`;
    const weight = document.getElementById(`weight_${i}`).value;
    const measures = document.getElementById(`measures_${i}`).value;
    const notes = document.getElementById(`notes_${i}`).value;

    const data = {
      title,
      weight,
      measures,
      notes,
    };

    localStorage.setItem(`block_${i}`, JSON.stringify(data));
  }
});
