// Importa módulos do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDN9467SDNNgmLsS-p-HaF0jNzyme9eKj4",
    authDomain: "app-apostas-72373.firebaseapp.com",
    projectId: "app-apostas-72373",
    storageBucket: "app-apostas-72373.appspot.com",
    messagingSenderId: "13035075006",
    appId: "1:13035075006:web:495552d13486b957e7b5ef"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referências aos elementos do DOM
const betTitleInput = document.getElementById('bet-title');
const betOptionsInput = document.getElementById('bet-options');
const betPenaltyInput = document.getElementById('bet-penalty');
const createBetButton = document.getElementById('createBetButton');
const betList = document.getElementById('bet-list');

// Função para criar uma nova aposta
async function createBet() {
  const betTitle = betTitleInput.value.trim();
  const betOptions = betOptionsInput.value.trim();
  const betPenalty = betPenaltyInput.value.trim();
  
  if (betTitle && betOptions && betPenalty) {
    await addDoc(collection(db, 'bets'), {
      title: betTitle,
      options: betOptions.split(',').map(option => option.trim()),
      penalty: betPenalty
    });
    betTitleInput.value = '';
    betOptionsInput.value = '';
    betPenaltyInput.value = '';
    displayBets();
  } else {
    alert('Por favor, preencha todos os campos.');
  }
}

// Função para exibir todas as apostas
async function displayBets() {
  const querySnapshot = await getDocs(collection(db, 'bets'));
  betList.innerHTML = '';
  querySnapshot.forEach((doc) => {
    const bet = doc.data();
    const listItem = document.createElement('div');
    listItem.innerHTML = `
      <h2>${bet.title}</h2>
      <p><strong>Opções:</strong> ${bet.options.join(', ')}</p>
      <p><strong>Penalidade:</strong> ${bet.penalty}</p>
      <button onclick="clearBet('${doc.id}')">Apagar Aposta</button>
      <hr />
    `;
    betList.appendChild(listItem);
  });
}

// Função para apagar uma aposta específica
async function clearBet(id) {
  await deleteDoc(doc(db, 'bets', id));
  displayBets();
}

// Adiciona os event listeners aos botões
createBetButton.addEventListener('click', createBet);

// Carrega as apostas ao iniciar a página
displayBets();