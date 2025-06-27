document.addEventListener('DOMContentLoaded', () => {
  const weeksInput = document.getElementById('weeks');
  const container = document.getElementById('weeksContainer');

  // Restaurar semanas salvas
  const savedWeeks = localStorage.getItem('totalWeeks');
  if (savedWeeks) {
    weeksInput.value = savedWeeks;
    generateWeeks(savedWeeks);
  }

  // Botão de gerar
  document.querySelector('button').addEventListener('click', () => {
    const weeks = parseInt(weeksInput.value);
    if (isNaN(weeks) || weeks < 1) {
      alert('Por favor, insira um número válido de semanas.');
      return;
    }
    localStorage.setItem('totalWeeks', weeks);
    generateWeeks(weeks);
  });

  function generateWeeks(weeks) {
    container.innerHTML = '';
    for (let i = 1; i <= weeks; i++) {
      const data = JSON.parse(localStorage.getItem(`week_${i}`)) || {
        weight: '',
        measures: '',
        notes: ''
      };

      const block = document.createElement('div');
      block.className = 'week-block';
      block.innerHTML = `
        <h2>📦 Semana ${i}</h2>

        <label>📸 Fotos (não são salvas):</label>
        <input type="file" accept="image/*" multiple>

        <label>⚖️ Peso (kg):</label>
        <input type="number" step="0.1" id="weight_${i}" value="${data.weight}">

        <label>📏 Medidas:</label>
        <input type="text" id="measures_${i}" value="${data.measures}">

        <label>📝 Observações:</label>
        <input type="text" id="notes_${i}" value="${data.notes}">
      `;

      setTimeout(() => {
        ['weight', 'measures', 'notes'].forEach(field => {
          const input = document.getElementById(`${field}_${i}`);
          input.addEventListener('input', () => {
            const updated = {
              weight: document.getElementById(`weight_${i}`).value,
              measures: document.getElementById(`measures_${i}`).value,
              notes: document.getElementById(`notes_${i}`).value,
            };
            localStorage.setItem(`week_${i}`, JSON.stringify(updated));
          });
        });
      }, 100);

      container.appendChild(block);
    }
  }
});

