const CLOUD_NAME = 'dl0onbrlm';  // Seu Cloud Name do Cloudinary
const UPLOAD_PRESET = 'unsigned_preset'; // Nome do preset criado no Cloudinary

// Estado global
let blocksData = [];

// Referências DOM
const numBlocksInput = document.getElementById('numBlocks');
const createBlocksBtn = document.getElementById('createBlocksBtn');
const blocksContainer = document.getElementById('blocksContainer');

// Inicialização - carrega dados do localStorage
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('blocksData');
  if (saved) {
    blocksData = JSON.parse(saved);
    renderBlocks();
  }
});

// Cria blocos conforme o número digitado
createBlocksBtn.addEventListener('click', () => {
  const n = parseInt(numBlocksInput.value);
  if (isNaN(n) || n < 1 || n > 52) {
    alert('Digite um número entre 1 e 52.');
    return;
  }

  // Se a quantidade for maior, adiciona; se for menor, remove
  if (n > blocksData.length) {
    for (let i = blocksData.length; i < n; i++) {
      blocksData.push({
        name: `Bloco ${i + 1}`,
        peso: '',
        medidas: '',
        images: []
      });
    }
  } else if (n < blocksData.length) {
    blocksData = blocksData.slice(0, n);
  }

  saveAndRender();
});

// Salva no localStorage
function saveAndRender() {
  localStorage.setItem('blocksData', JSON.stringify(blocksData));
  renderBlocks();
}

// Renderiza os blocos
function renderBlocks() {
  blocksContainer.innerHTML = '';
  blocksData.forEach((block, index) => {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block';

    blockDiv.innerHTML = `
      <h2>📦 <input type="text" value="${block.name}" data-index="${index}" class="block-name" style="font-size:1.2rem; width: 60%;" /></h2>
      
      <label>Peso (kg):</label>
      <input type="number" step="0.1" value="${block.peso}" data-index="${index}" class="block-peso" />
      
      <label>Medidas:</label>
      <input type="text" value="${block.medidas}" data-index="${index}" class="block-medidas" placeholder="Ex: 90cm cintura, 100cm peito" />
      
      <label>Fotos (máx 3):</label>
      <input type="file" data-index="${index}" class="block-file" accept="image/*" multiple />
      
      <div class="images-preview" data-index="${index}"></div>
    `;

    blocksContainer.appendChild(blockDiv);
  });

  // Add event listeners para inputs
  document.querySelectorAll('.block-name').forEach(input => {
    input.addEventListener('input', e => {
      const i = e.target.dataset.index;
      blocksData[i].name = e.target.value;
      saveAndRender();
    });
  });

  document.querySelectorAll('.block-peso').forEach(input => {
    input.addEventListener('input', e => {
      const i = e.target.dataset.index;
      blocksData[i].peso = e.target.value;
      saveAndRender();
    });
  });

  document.querySelectorAll('.block-medidas').forEach(input => {
    input.addEventListener('input', e => {
      const i = e.target.dataset.index;
      blocksData[i].medidas = e.target.value;
      saveAndRender();
    });
  });

  document.querySelectorAll('.block-file').forEach(input => {
    input.addEventListener('change', async e => {
      const i = e.target.dataset.index;
      const files = e.target.files;
      if (!files.length) return;

      const previewDiv = blocksContainer.querySelector(`.images-preview[data-index="${i}"]`);
      
      // Upload e preview
      for (let file of files) {
        if (blocksData[i].images.length >= 3) {
          alert('Máximo 3 fotos por bloco');
          break;
        }
        try {
          const url = await uploadImageToCloudinary(file);
          blocksData[i].images.push(url);
          saveAndRender();
          addImagePreview(previewDiv, url);
        } catch {
          alert('Erro no upload da imagem');
        }
      }

      // Limpar o input para poder enviar a mesma imagem de novo se quiser
      e.target.value = '';
    });
  });

  // Renderiza as imagens salvas
  blocksData.forEach((block, i) => {
    const previewDiv = blocksContainer.querySelector(`.images-preview[data-index="${i}"]`);
    if (previewDiv) {
      previewDiv.innerHTML = '';
      block.images.forEach(url => {
        addImagePreview(previewDiv, url);
      });
    }
  });
}

// Adiciona uma imagem no preview
function addImagePreview(container, url) {
  const img = document.createElement('img');
  img.src = url;
  img.className = 'preview';
  container.appendChild(img);
}

// Função para upload no Cloudinary
async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Upload falhou');

  const data = await response.json();
  return data.secure_url;
}
