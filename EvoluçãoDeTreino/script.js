// CONFIGURAÇÕES CLOUDINARY - ajuste para seus dados reais
const CLOUD_NAME = 'dl0onbrlm';  // Seu Cloud Name do Cloudinary
const UPLOAD_PRESET = 'unsigned_preset'; // Nome do preset criado no Cloudinary

// Estado global
let blocksData = [];

// Referências DOM
const numBlocksInput = document.getElementById('numBlocks');
const createBlocksBtn = document.getElementById('createBlocksBtn');
const blocksContainer = document.getElementById('blocksContainer');
const compareBtn = document.getElementById('compareBtn');

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

// Botão para comparar fotos
compareBtn.addEventListener('click', () => {
  showComparisonView();
});

// Salva no localStorage e atualiza UI
function saveAndRender() {
  localStorage.setItem('blocksData', JSON.stringify(blocksData));
  renderBlocks();
}

// Renderiza os blocos no container
function renderBlocks() {
  blocksContainer.innerHTML = '';
  blocksData.forEach((block, index) => {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'block';

    blockDiv.innerHTML = `
      <h2>📦 <input type="text" value="${block.name}" data-index="${index}" class="block-name" placeholder="Nome do bloco" /></h2>
      
      <label>Peso (kg):</label>
      <input type="number" step="0.1" value="${block.peso}" data-index="${index}" class="block-peso" placeholder="Ex: 75.5" />
      
      <label>Medidas:</label>
      <input type="text" value="${block.medidas}" data-index="${index}" class="block-medidas" placeholder="Ex: 90cm cintura, 100cm peito" />
      
      <label>Fotos (máx 3):</label>
      <input type="file" data-index="${index}" class="block-file" accept="image/*" multiple />
      
      <div class="images-preview" data-index="${index}"></div>
    `;

    blocksContainer.appendChild(blockDiv);
  });

  // Inputs de texto e número
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

  // Upload de imagens
  document.querySelectorAll('.block-file').forEach(input => {
    input.addEventListener('change', async e => {
      const i = e.target.dataset.index;
      const files = e.target.files;
      if (!files.length) return;

      const previewDiv = blocksContainer.querySelector(`.images-preview[data-index="${i}"]`);

      for (let file of files) {
        if (blocksData[i].images.length >= 3) {
          alert('Máximo 3 fotos por bloco');
          break;
        }
        try {
          const url = await uploadImageToCloudinary(file);
          blocksData[i].images.push(url);
          saveAndRender();
          addImagePreview(previewDiv, url, i, blocksData[i].images.length - 1);
        } catch {
          alert('Erro no upload da imagem');
        }
      }

      e.target.value = ''; // resetar input
    });
  });

  // Renderizar imagens existentes
  blocksData.forEach((block, i) => {
    const previewDiv = blocksContainer.querySelector(`.images-preview[data-index="${i}"]`);
    if (previewDiv) {
      previewDiv.innerHTML = '';
      block.images.forEach((url, imgIdx) => {
        addImagePreview(previewDiv, url, i, imgIdx);
      });
    }
  });
}

// Adiciona preview com botão de exclusão
function addImagePreview(container, url, blockIndex, imageIndex) {
  const wrapper = document.createElement('div');
  wrapper.className = 'preview-container';

  const img = document.createElement('img');
  img.src = url;
  img.className = 'preview';

  const btn = document.createElement('button');
  btn.textContent = '×';
  btn.className = 'delete-photo';
  btn.title = 'Excluir foto';

  btn.addEventListener('click', () => {
    blocksData[blockIndex].images.splice(imageIndex, 1);
    saveAndRender();
  });

  wrapper.appendChild(img);
  wrapper.appendChild(btn);
  container.appendChild(wrapper);
}

// Upload para Cloudinary (requer preset unsigned)
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

// Mostrar fotos lado a lado para comparação
function showComparisonView() {
  const maxPhotos = Math.max(...blocksData.map(b => b.images.length));
  if (maxPhotos === 0) {
    alert('Nenhuma foto para comparar.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
  overlay.style.overflowY = 'auto';
  overlay.style.zIndex = 9999;
  overlay.style.padding = '20px';
  overlay.style.color = 'white';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Fechar ✖';
  closeBtn.style.position = 'fixed';
  closeBtn.style.top = '20px';
  closeBtn.style.right = '20px';
  closeBtn.style.padding = '10px 15px';
  closeBtn.style.fontSize = '16px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.backgroundColor = '#003F7F';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.color = 'white';
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });

  overlay.appendChild(closeBtn);

  for (let photoIndex = 0; photoIndex < maxPhotos; photoIndex++) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '30px';

    const title = document.createElement('h3');
    title.textContent = `Fotos ${photoIndex + 1}`;
    title.style.width = '120px';
    row.appendChild(title);

    blocksData.forEach(block => {
      const imgUrl = block.images[photoIndex];
      const imgWrapper = document.createElement('div');
      imgWrapper.style.marginRight = '15px';

      if (imgUrl) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.style.maxWidth = '150px';
        img.style.borderRadius = '8px';
        img.style.border = '3px solid white';
        imgWrapper.appendChild(img);
      } else {
        const placeholder = document.createElement('div');
        placeholder.textContent = '—';
        placeholder.style.width = '150px';
        placeholder.style.height = '100px';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.color = '#ccc';
        imgWrapper.appendChild(placeholder);
      }

      row.appendChild(imgWrapper);
    });

    overlay.appendChild(row);
  }

  document.body.appendChild(overlay);
}
