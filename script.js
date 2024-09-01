// Importar funções necessárias do Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDN9467SDNNgmLsS-p-HaF0jNzyme9eKj4",
    authDomain: "app-apostas-72373.firebaseapp.com",
    projectId: "app-apostas-72373",
    storageBucket: "app-apostas-72373.appspot.com",
    messagingSenderId: "13035075006",
    appId: "1:13035075006:web:495552d13486b957e7b5ef"
};

// Inicializar o Firebase
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
        try {
            await addDoc(collection(db, 'bets'), {
                title: betTitle,
                options: betOptions.split(',').map(option => option.trim()),
                penalty: betPenalty,
                createdAt: serverTimestamp(),
                choices: [] // Inicialmente, nenhuma escolha foi feita
            });
            betTitleInput.value = '';
            betOptionsInput.value = '';
            betPenaltyInput.value = '';
            displayBets();
        } catch (error) {
            console.error("Erro ao criar a aposta: ", error);
        }
    } else {
        alert('Por favor, preencha todos os campos.');
    }
}

// Função para exibir todas as apostas
async function displayBets() {
    try {
        const querySnapshot = await getDocs(collection(db, 'bets'));
        betList.innerHTML = '';
        querySnapshot.forEach((docSnapshot) => {
            const bet = docSnapshot.data();
            const listItem = document.createElement('div');
            listItem.innerHTML = `
                <h2>${bet.title}</h2>
                <p><strong>Penalidade:</strong> ${bet.penalty}</p>
                <hr />
                <h3>Escolha uma opção:</h3>
                ${bet.options.map(option => `<button onclick="chooseOption('${docSnapshot.id}', '${option}')">${option}</button>`).join(' ')}
                <h4>Escolhas:</h4>
                <ul>
                    ${bet.choices.map(choice => `<li>${choice.name}: ${choice.option}</li>`).join('')}
                </ul>
                <button onclick="clearBet('${docSnapshot.id}')">Apagar Aposta</button>
                <hr />
            `;
            betList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Erro ao exibir apostas: ", error);
    }
}

// Função para apagar uma aposta específica
async function clearBet(id) {
    try {
        await deleteDoc(doc(db, 'bets', id));
        displayBets();
    } catch (error) {
        console.error("Erro ao apagar a aposta: ", error);
    }
}

// Função para escolher uma opção de aposta
async function chooseOption(betId, option) {
    const userName = prompt("Insira seu nome para escolher esta opção:");
    if (userName) {
        try {
            const betDocRef = doc(db, 'bets', betId);
            const betDoc = await getDoc(betDocRef); // Usando getDoc() em vez de get()
            const betData = betDoc.data();
            const newChoice = { name: userName, option: option };
            await updateDoc(betDocRef, {
                choices: [...betData.choices, newChoice]
            });
            displayBets();
        } catch (error) {
            console.error("Erro ao registrar escolha: ", error);
        }
    } else {
        alert('Nome é necessário para votar.');
    }
}

// Tornar as funções acessíveis globalmente
window.clearBet = clearBet;
window.chooseOption = chooseOption;

// Adiciona os event listeners aos botões
createBetButton.addEventListener('click', createBet);

// Carrega as apostas ao iniciar a página
displayBets();
